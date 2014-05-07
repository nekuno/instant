var server = require('http').createServer();
var config = require('./config/config.js');

server.listen(config.server.port);

var chat = require('./resources/chat.js');
chat.startSocketServer(server);

