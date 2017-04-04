var NotificationsSocketManager = function(io) {

    this.sockets = io.of('/notifications');
    this.sockets
        .on('connection', function(socket) {

            var user = socket.handshake.user;
            socket.join(user.id);
        });
};

NotificationsSocketManager.prototype.notify = function(userId, category, data) {
    this.sockets.to(userId).emit('notification', category, data);
};

module.exports = NotificationsSocketManager;