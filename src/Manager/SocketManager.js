'use strict';

var SocketManager = function(io, database, userManager) {

    var self = this;
    this.database = database;
    this.userManager = userManager;

    io
        .of('/chat')
        .authorization(function(handshakeData, accept) {

            self._authorize(handshakeData, accept);
        });

    io
        .of('/workers')
        .authorization(function(handshakeData, accept) {

            self._authorize(handshakeData, accept);
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