'use strict';

var SocketManager = function(io, database) {

    var self = this;
    this.database = database;

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
            .get(token)
            .then(function(user) {

                if (!user) {

                    return accept('unauthorized token ' + token, false);
                }

                handshakeData.user = user.toObject();

                return accept(null, true);
            });

    } else {

        accept('token needed', false);

    }
};

SocketManager.prototype.get = function(token) {

    var User = this.database.model('User');

    return User
        .query({where: {salt: token}})
        .fetch();

};

module.exports = SocketManager;