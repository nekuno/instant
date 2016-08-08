var WorkersSocketManager = function(io) {

    this.sockets = io.of('/workers');
    this.sockets
        .on('connection', function(socket) {

            var user = socket.handshake.user;
            socket.join(user.id);
        });
};

WorkersSocketManager.prototype.fetchStart = function(userId, resource) {
    this.sockets.to(userId).emit('fetch.start', {resource: resource});
};

WorkersSocketManager.prototype.fetchFinish = function(userId, resource) {
    this.sockets.to(userId).emit('fetch.finish', {resource: resource});
};

WorkersSocketManager.prototype.processStart = function(userId, resource) {
    this.sockets.to(userId).emit('process.start', {resource: resource});
};

WorkersSocketManager.prototype.processLink = function(userId, resource, percentage) {
    this.sockets.to(userId).emit('process.link', {resource: resource, percentage: percentage});
};

WorkersSocketManager.prototype.processFinish = function(userId, resource) {
    this.sockets.to(userId).emit('process.finish', {resource: resource});
};

WorkersSocketManager.prototype.similarityStart = function(userId) {
    this.sockets.to(userId).emit('similarity.start', {});
};

WorkersSocketManager.prototype.similarityStep = function(userId, percentage) {
    this.sockets.to(userId).emit('similarity.step', {percentage: percentage});
};

WorkersSocketManager.prototype.similarityFinish = function(userId) {
    this.sockets.to(userId).emit('similarity.finish', {});
};

WorkersSocketManager.prototype.matchingStart = function(userId) {
    this.sockets.to(userId).emit('matching.start', {});
};

WorkersSocketManager.prototype.matchingStep = function(userId, percentage) {
    this.sockets.to(userId).emit('matching.step', {percentage: percentage});
};

WorkersSocketManager.prototype.matchingFinish = function(userId) {
    this.sockets.to(userId).emit('matching.finish', {});
};

WorkersSocketManager.prototype.userStatus = function(userId, status) {
    this.sockets.to(userId).emit('user.status', {status: status});
};

module.exports = WorkersSocketManager;