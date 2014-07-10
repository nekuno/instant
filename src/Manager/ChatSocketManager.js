var validator = require('validator');

var ChatSocketManager = function(database) {

    this.database = database;
    this.sockets = {};
};

ChatSocketManager.prototype.add = function(socket) {

    var self = this;
    var userFrom = socket.user.id;
    var Message = this.database.model('Message');

    // Notify users the new user connected
    // TODO: Notify only some users
    socket.broadcast.emit('user_status', userFrom, 'online');
    // Notify new user with already connected users
    for (var userId in self.sockets) {
        socket.emit('user_status', userId, 'online');
    }
    self.sockets[userFrom] ? self.sockets[userFrom].push(socket) : self.sockets[userFrom] = [socket];

    // TODO: Verify the message can be delivered
    socket.on('send_message', function(userTo, messageText) {

        var messageTextEscaped = validator.escape(messageText);
        var timestamp = new Date();

        if (self.sockets[userTo]) {
            self.sockets[userTo].forEach(function(socket) {
                socket.emit('update_chat', userFrom, messageTextEscaped, 'in', timestamp.toISOString());
            });
        }

        self.sockets[userFrom].forEach(function(socket) {
            socket.emit('update_chat', userTo, messageTextEscaped, 'out', timestamp.toISOString());
        });

        Message.forge({
            user_from: userFrom,
            user_to  : userTo,
            text     : messageTextEscaped,
            readed   : 0,
            createdAt: timestamp
        }).save().then(function(message) {
//            console.log(message);
        });
    });

    socket.on('disconnect', function() {
        socket.broadcast.emit('user_status', userFrom, 'offline');
        self.sockets[userFrom].forEach(function(item, index) {
            if (socket === item) {
                delete self.sockets[userFrom][index];
            }
        });

    });
};

module.exports = ChatSocketManager;