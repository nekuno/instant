var validator = require('validator');
var async = require('async');

var ChatSocketManager = function(io, database, userManager) {

    var self = this;
    this.database = database;
    this.userManager = userManager;
    this.sockets = {};
    io
        .of('/chat')
        .on('connection', function(socket) {

            self.add(socket);
        });
};

ChatSocketManager.prototype.add = function(socket) {

    var self = this;
    var user = socket.handshake.user;
    delete socket.handshake.user;
    var userFrom = user.id;
    var User = this.database.model('User');
    var Message = this.database.model('Message');

    // Users who can be contacted from userFrom
    User.findUsersCanContactFrom(userFrom).then(function(users) {

        users.forEach(function(user) {
            if (self.sockets[user.id] && self.sockets[user.id].length > 0) {
                socket.emit('userStatus', user.id, 'online');
            }
        });

        var all = users.map(function(user) {
            return user.id;
        });

        Message
            .query()
            .andWhere(function() {
                this
                    .where(function() {
                        this.where('user_from', userFrom);
                        if (all.length > 0) {
                            this.whereIn('user_to', all);
                        }
                    })
                    .orWhere(function() {
                        this.where('user_to', userFrom);
                        if (all.length > 0) {
                            this.whereIn('user_from', all);
                        }
                    });
            })
            .orderBy('createdAt', 'DESC')
            .limit(10)
            .then(function(messages) {

                var q = async.queue(function(user, callback) {
                    self.userManager.find(user, function(user) {
                        callback(user);
                    });
                }, 1);

                q.drain = function() {
                    socket.emit('messages', messages);
                };

                messages.forEach(function(message) {

                    delete message.id;

                    q.push(userFrom, function(user) {
                        message.user = user;
                    });

                    q.push(message.user_from, function(user) {
                        message.user_from = user;
                    });

                    q.push(message.user_to, function(user) {
                        message.user_to = user;
                    });
                });

            });
    });

    // Users that can contact to userFrom
    User.findUsersCanContactTo(userFrom).then(function(users) {

        users.forEach(function(user) {
            if (self.sockets[user.id]) {
                self.sockets[user.id].forEach(function(socket) {
                    socket.emit('userStatus', userFrom, 'online');
                });
            }
        });
    });

    self.sockets[userFrom] ? self.sockets[userFrom].push(socket) : self.sockets[userFrom] = [socket];

    socket.emit('user', user);

    socket.on('sendMessage', function(userTo, messageText) {

        User
            .canContact(userFrom, userTo)
            .then(function(canContact) {

                if (canContact) {

                    var messageTextEscaped = validator.escape(messageText);
                    var timestamp = new Date();

                    Message
                        .forge({
                            user_from: userFrom,
                            user_to  : userTo,
                            text     : messageTextEscaped,
                            readed   : 0,
                            createdAt: timestamp
                        })
                        .save()
                        .then(function(message) {

                            message = message.toJSON();

                            var q = async.queue(function(user, callback) {
                                self.userManager.find(user, function(user) {
                                    callback(user);
                                });
                            }, 1);

                            q.drain = function() {

                                if (self.sockets[userTo]) {
                                    self.sockets[userTo].forEach(function(socket) {
                                        self.userManager.find(userTo, function(user) {
                                            message.user = user;
                                            socket.emit('messages', [message]);
                                        });
                                    });
                                }

                                self.sockets[userFrom].forEach(function(socket) {
                                    self.userManager.find(userFrom, function(user) {
                                        message.user = user;
                                        socket.emit('messages', [message]);
                                    });
                                });
                            };

                            delete message.id;

                            q.push(message.user_from, function(user) {
                                message.user_from = user;
                            });

                            q.push(message.user_to, function(user) {
                                message.user_to = user;
                            });

                        });
                } else {
                    console.error('user ' + userFrom + ' can not contact user ' + userTo);
                }

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

        User.findUsersCanContactTo(userFrom).then(function(users) {
            users.forEach(function(user) {
                if (self.sockets[user.id]) {
                    self.sockets[user.id].forEach(function(socket) {
                        socket.emit('userStatus', userFrom, 'offline');
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

module.exports = ChatSocketManager;