var Promise = require('bluebird');

var ChatSocketManager = function(io, database, userManager, pushNotificationsManager) {

    var self = this;
    this.database = database;
    this.userManager = userManager;
    this.pushNotificationsManager = pushNotificationsManager;
    this.sockets = {};
    io
        .of('/chat')
        .on('connection', function(socket) {

            self.add(socket);
        });
};

ChatSocketManager.prototype.message = function(userFromId, userToId, text) {
    this._send(userFromId, userToId, text, function(a){});
};

ChatSocketManager.prototype.add = function(socket) {

    var self = this;
    var user = socket.handshake.user;
    delete socket.handshake.user;
    var userFrom = user.id;
    var Message = this.database.model('Message');

    var send = function(messages, fresh) {

        var all = [];
        messages.forEach(function(message) {

            message.user = user;

            all.push(Promise.join(self.userManager.find(message.user_from), self.userManager.find(message.user_to), function(user_from, user_to) {
                message.user_from = user_from;
                message.user_to = user_to;
            }));

        });

        Promise.all(all).then(function() {
            socket.emit('messages', messages, fresh);
        });
    };

    var sendPaginated = function(messages, offset, limit) {
        var paginatedMessages = [];
        var usersCount = 0;

        messages.forEach(function(message) {
            var userExistsInMessages = paginatedMessages.some(function(paginatedMessage) {
                return paginatedMessage.user_to === message.user_to && paginatedMessage.user_from === message.user_from ||
                    paginatedMessage.user_to === message.user_from && paginatedMessage.user_from === message.user_to;
            });
            if (!userExistsInMessages) {
                usersCount++;
            }
            if (offset < usersCount && limit > paginatedMessages.length || userExistsInMessages) {
                paginatedMessages.push(message);
            }
        });

        if (paginatedMessages.length === 0) {
            socket.emit('no-messages');
        } else {
            send(paginatedMessages.reverse(), false);
        }
    };

    var getThreadsMessages = function(offset, limit) {
        // Users who can be contacted from userFrom
        self.userManager
            .findUsersCanContactFrom(userFrom)
            .then(function(users) {
                return Promise.all(users.map(function(user) {
                    if (self.sockets[user.id] && self.sockets[user.id].length > 0) {
                        socket.emit('userStatus', user, 'online');
                    }

                    return Message
                        .query()
                        .where(function() {
                            this
                                .where(function() {
                                    this
                                        .where('user_from', userFrom)
                                        .andWhere('user_to', user.id);
                                })
                                .orWhere(function() {
                                    this
                                        .where('user_from', user.id)
                                        .andWhere('user_to', userFrom);
                                });
                        })
                        .orderBy('createdAt', 'DESC')
                        .orderBy('id', 'DESC')
                        .limit(10)
                        .then(function(messages) {
                           return messages;
                        });
                    }
                ));
            }).then(function(threads) {
                threads = [].concat.apply([], threads);
                threads = threads.sort(function(a, b) {
                    if (a.createdAt < b.createdAt) {
                        return 1;
                    } else if (a.createdAt > b.createdAt) {
                        return -1;
                    }
                    return 0;
                });

                sendPaginated(threads, offset, limit);
            }
        );

        // Users that can contact to userFrom
        self.userManager
            .findUsersCanContactTo(userFrom)
            .then(function(users) {
                users.forEach(function(otherUser) {

                    if (self.sockets[otherUser.id]) {
                        self.sockets[otherUser.id].forEach(function(socket) {
                            socket.emit('userStatus', user, 'online');
                        });
                    }

                });
            });


        self.sockets[userFrom] ? self.sockets[userFrom].push(socket) : self.sockets[userFrom] = [socket];

        socket.emit('user', user);
    };

    socket.on('getThreadsMessages', function(offset, limit) {
        getThreadsMessages(offset, limit);
    });

    socket.on('sendMessage', function(userTo, messageText, callback) {
        self._send(userFrom, userTo, messageText, callback);
    });

    socket.on('getMessages', function(user, offset, callback) {

        Message
            .query()
            .andWhere(function() {
                this
                    .where(function() {
                        this
                            .where('user_from', userFrom)
                            .andWhere('user_to', user);
                    })
                    .orWhere(function() {
                        this
                            .where('user_from', user)
                            .andWhere('user_to', userFrom);
                    });
            })
            .orderBy('createdAt', 'DESC')
            .orderBy('id', 'DESC')
            .offset(offset)
            .limit(10)
            .then(function(messages) {
                messages.length == 0 ? callback() : send(messages, false);
            });
    });

    socket.on('markAsReaded', function(user, timestamp) {

        Message
            .query()
            .where('createdAt', '<=', new Date(timestamp))
            .andWhere('user_from', user)
            .andWhere('user_to', userFrom)
            .andWhere('readed', 0)
            .update({
                readed: 1
            }).then();
    });

    socket.on('disconnect', function() {

        self.userManager
            .findUsersCanContactTo(userFrom)
            .then(function(users) {
                users.forEach(function(otherUser) {
                    if (self.sockets[otherUser.id]) {
                        self.sockets[otherUser.id].forEach(function(socket) {
                            socket.emit('userStatus', user, 'offline');
                        });
                    }
                });
            });

        self.sockets[userFrom].forEach(function(item, index) {
            if (socket === item) {
                self.sockets[userFrom].splice(index, 1);
            }
        });

    });
};


ChatSocketManager.prototype._send = function (userFrom, userTo, messageText, callback) {
    var self = this;
    var Message = this.database.model('Message');

    if (messageText === '') {
        return;
    }

    if (messageText.length > 3000) {
        console.error('Message text is too long');
        callback('Message text is too long');
        return;
    }

    self.userManager
        .canContact(userFrom, userTo)
        .then(function(canContact) {

            if (canContact) {

                var timestamp = new Date();
                timestamp.setMilliseconds(0);

                Message
                    .forge({
                        user_from: userFrom,
                        user_to  : userTo,
                        text     : messageText,
                        readed   : 0,
                        createdAt: timestamp
                    })
                    .save()
                    .then(function(message) {

                        message = message.toJSON();

                        Promise.join(self.userManager.find(message.user_from), self.userManager.find(message.user_to), function(user_from, user_to) {

                            message.user_from = user_from;
                            message.user_to = user_to;

                            if (self.sockets[userTo]) {
                                self.userManager
                                    .find(userTo)
                                    .then(function(user) {
                                        self.sockets[userTo].forEach(function(socket) {
                                            message.user = user;
                                            socket.emit('messages', [message], true);
                                        });
                                        const category = 'message';
                                        const data = {
                                            slug: user_from.slug,
                                            username: user_from.username,
                                            image: user_from.photo.thumbnail.big,
                                            body: message.text
                                        };
                                        self.pushNotificationsManager.notify(userTo, category, data);
                                    });
                            }

                            if (self.sockets[userFrom]) {
                                self.sockets[userFrom].forEach(function (socket) {
                                    message.user = user_from;
                                    socket.emit('messages', [message], true);
                                });
                            }
                        });
                    })
                    .catch(function(error) {
                        console.error(error);
                        callback('Error saving message');
                    });
            } else {
                console.error('user ' + userFrom + ' can not contact user ' + userTo);
                callback('user ' + userFrom + ' can not contact user ' + userTo);
            }

        });
};

module.exports = ChatSocketManager;