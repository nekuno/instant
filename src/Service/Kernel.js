var Kernel = function(container) {

    var params = container.get('params');
    var server;

    if (params.server.type === 'http') {

        server = require(params.server.type).createServer();

    } else if (params.server.type === 'https') {

        var fs = require('fs');
        var options = {
            key : fs.readFileSync(params.server.key),
            cert: fs.readFileSync(params.server.cert)
        };
        server = require(params.server.type).createServer(options);

    }
    server.listen(params.server.port);

    var io = require('socket.io').listen(server);
    io.set('log level', 1);
    container.add('io', io);

};

Kernel.prototype.run = function() {

};

module.exports = Kernel;