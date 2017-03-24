var NotificationsSocketManager = function(io) {

    this.sockets = io.of('/notifications');
    this.sockets
        .on('connection', function(socket) {

            var user = socket.handshake.user;
            socket.join(user.id);
        });
};

NotificationsSocketManager.prototype.notify = function(userId, data) {
    this.sockets.to(userId).emit('notification', data);
};

module.exports = NotificationsSocketManager;