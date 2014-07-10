'use strict';

var ChatManager = function(io, chatSocketManager, database) {

    var self = this;
    this.chatSocketManager = chatSocketManager;
    this.database = database;

    io
        .of('/chat')
        .authorization(function(handshakeData, accept) {

            self._authorize(handshakeData, accept);
        })
        .on('connection', function(socket) {

            self._connect(socket);
        });
};

ChatManager.prototype._authorize = function(handshakeData, accept) {

    var token = handshakeData.query.token;

    if (token) {

        this
            .get(token)
            .then(function(user) {

                if (!user) {

                    return accept('unauthorized token ' + token, false);
                }

                handshakeData.user = user;

                return accept(null, true);
            });

    } else {

        accept('token needed', false);

    }
};

ChatManager.prototype._connect = function(socket) {

    socket.user = socket.handshake.user;
    this.chatSocketManager.add(socket);

};

ChatManager.prototype.get = function(token) {

    var User = this.database.model('User');

    return User
        .query({where: {salt: token}})
        .fetch();

};

module.exports = ChatManager;