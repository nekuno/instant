'use strict';

var SocketManager = function(io, database, userManager) {

    var self = this;
    this.database = database;
    this.userManager = userManager;

    io
        .of('/chat').use(function(socket, next) {
            self._authorize(socket.handshake, next);
        });

    io
        .of('/workers').use(function(socket, next) {
            self._authorize(socket.handshake, next);
        });
};

SocketManager.prototype._authorize = function(handshakeData, accept) {

    var token = handshakeData.query.token;

    if (token) {

        this
            .userManager.findByToken(token)
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

module.exports = SocketManager;