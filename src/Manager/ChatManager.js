'use strict';

var ChatManager = function(io) {

    var self = this;

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

    var user = socket.handshake.user;

    if (user) {

        console.log('socket connected', user);
    }
};

ChatManager.prototype.get = function(token, callback) {

    // TODO: Validate token
    var error = token !== '1234';
    callback(error, {
        token: token
    });
};

module.exports = ChatManager;