'use strict';

var ChatManager = function(io, chatSocketManager) {

    var self = this;
    this.chatSocketManager = chatSocketManager;

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

        this.get(token, function(error, user) {

            if (error || !user) {

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

ChatManager.prototype.get = function(token, callback) {

    // TODO: Validate token
    var error = [1, 2, 3, 4].indexOf(token) !== -1;
    callback(error, {
        id   : token,
        token: token
    });
};

module.exports = ChatManager;