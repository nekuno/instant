var WorkersSocketManager = function(io) {

    this.sockets = io.of('/workers');
    this.sockets
        .on('connection', function(socket) {

            var user = socket.handshake.user;
            socket.join(user.id);
        });
};

WorkersSocketManager.prototype.fetch = function(userId, resource, percentage) {

    this.sockets.to(userId).emit('fetch', {
        resource  : resource,
        percentage: percentage
    });

};
WorkersSocketManager.prototype.process = function(userId, resource, percentage) {

    this.sockets.to(userId).emit('process', {
        resource  : resource,
        percentage: percentage
    });

};

module.exports = WorkersSocketManager;