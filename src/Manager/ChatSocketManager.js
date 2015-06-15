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

    var send = function(messages, fresh) {

        var q = async.queue(function(user, callback) {
            self.userManager.find(user, function(user) {
                callback(user);
            });
        }, 1);

        q.drain = function() {
            socket.emit('messages', messages, fresh);
        };

        messages.forEach(function(message) {

            delete message.id;

            message.user = user;

            q.push(message.user_from, function(user) {
                message.user_from = user;
            });

            q.push(message.user_to, function(user) {
                message.user_to = user;
            });
        });
    };

    // Users who can be contacted from userFrom
    User.findUsersCanContactFrom(userFrom).then(function(users) {

        users.forEach(function(user) {

            if (self.sockets[user.id] && self.sockets[user.id].length > 0) {
                socket.emit('userStatus', user, 'online');
            }

            Message
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
                    send(messages, true);
                });
        });

        Message
            .query()
            .count('id AS count')
            .where(function() {
                this
                    .where('user_from', userFrom)
                    .orWhere('user_to', userFrom);
            })
            .orderBy('createdAt', 'DESC')
            .then(function(count) {
                if (count[0].count === 0) {
                    socket.emit('no-messages');
                }
            });
    });

    // Users that can contact to userFrom
    User.findUsersCanContactTo(userFrom).then(function(users) {

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

    socket.on('sendMessage', function(userTo, messageText, callback) {

        User
            .canContact(userFrom, userTo)
            .then(function(canContact) {

                if (canContact) {

                    var messageTextEscaped = validator.escape(messageText);
                    var timestamp = new Date();
                    timestamp.setMilliseconds(0);

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
                                            socket.emit('messages', [message], true);
                                        });
                                    });
                                }

                                self.sockets[userFrom].forEach(function(socket) {
                                    message.user = user;
                                    socket.emit('messages', [message], true);
                                });

                                callback(false);
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
                    callback('user ' + userFrom + ' can not contact user ' + userTo);
                }

            });
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

        User.findUsersCanContactTo(userFrom).then(function(users) {
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

module.exports = ChatSocketManager;