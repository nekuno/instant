var WorkersSocketManager = function(io) {

    this.sockets = io.of('/workers');
    this.sockets
        .on('connection', function(socket) {

            var user = socket.handshake.user;
            socket.join(user.id);
        });
    this.similarity = {};
    this.matching = {};
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

WorkersSocketManager.prototype.similarityStart = function(userId, processId) {
    if (!this.similarity[userId]) {
        this.similarity[userId] = {};
    }
    this.sockets.to(userId).emit('similarity.start', {});
};

WorkersSocketManager.prototype.similarityStep = function(userId, processId, percentage) {
    if (!this.similarity[userId]) {
        this.similarity[userId] = {};
    }
    this.similarity[userId][processId] = percentage;
    percentage = 0;
    for (var id in this.similarity[userId]) {
        if (this.similarity[userId].hasOwnProperty(id)) {
            percentage += this.similarity[userId][id];
        }
    }
    percentage = parseInt(percentage / Object.keys(this.similarity[userId]).length, 10);

    this.sockets.to(userId).emit('similarity.step', {percentage: percentage});
};

WorkersSocketManager.prototype.similarityFinish = function(userId, processId) {
    var finish = true;
    for (var id in this.similarity[userId]) {
        if (this.similarity[userId].hasOwnProperty(id) && this.similarity[userId][id] < 100) {
            finish = false;
            break;
        }
    }
    if (finish) {
        delete this.similarity[userId];
        this.sockets.to(userId).emit('similarity.finish', {});
    }
};

WorkersSocketManager.prototype.matchingStart = function(userId, processId) {
    if (!this.matching[userId]) {
        this.matching[userId] = {};
    }
    this.sockets.to(userId).emit('matching.start', {});
};

WorkersSocketManager.prototype.matchingStep = function(userId, processId, percentage) {
    if (!this.matching[userId]) {
        this.matching[userId] = {};
    }
    this.matching[userId][processId] = percentage;
    percentage = 0;
    for (var id in this.matching[userId]) {
        if (this.matching[userId].hasOwnProperty(id)) {
            percentage += this.matching[userId][id];
        }
    }
    percentage = parseInt(percentage / Object.keys(this.matching[userId]).length, 10);

    this.sockets.to(userId).emit('matching.step', {percentage: percentage});
};

WorkersSocketManager.prototype.matchingFinish = function(userId, processId) {
    var finish = true;
    for (var id in this.matching[userId]) {
        if (this.matching[userId].hasOwnProperty(id) && this.matching[userId][id] < 100) {
            finish = false;
            break;
        }
    }
    if (finish) {
        delete this.matching[userId];
        this.sockets.to(userId).emit('matching.finish', {});
    }
};

WorkersSocketManager.prototype.userStatus = function(userId, status) {
    this.sockets.to(userId).emit('user.status', {status: status});
};

module.exports = WorkersSocketManager;