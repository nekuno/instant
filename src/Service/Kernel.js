var Kernel = function(container) {

    var params = container.get('params');

    var server = require('http').createServer();
    server.listen(params.server.port);

    var io = require('socket.io').listen(server);
    io.set('log level', 1);
    container.add('io', io);

};

Kernel.prototype.run = function() {

};

module.exports = Kernel;