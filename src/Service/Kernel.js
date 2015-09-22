var constants = require('constants');

var Kernel = function(container) {

    var params = container.get('params');
    var server;
    var express = require('express');
    var bodyParser = require('body-parser');
    var app = express();
    app.use(bodyParser.json());

    if (params.server.type === 'http') {

        server = require(params.server.type).createServer(app);

    } else if (params.server.type === 'https') {

        var fs = require('fs');
        var options = {
            secureProtocol: 'SSLv23_method',
            secureOptions : constants.SSL_OP_NO_SSLv3,
            key           : fs.readFileSync(params.server.key),
            cert          : fs.readFileSync(params.server.cert),
            ca            : fs.readFileSync(params.server.ca)
        };
        server = require(params.server.type).createServer(options, app);

    }
    server.listen(params.server.port);

    var io = require('socket.io').listen(server);
    io.set('log level', 1);
    container.add('io', io);
    container.add('app', app);

};

Kernel.prototype.run = function() {

};

module.exports = Kernel;