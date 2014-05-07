var server = require('http').createServer();
var io = require('socket.io').listen(server);
var	validator = require('validator');
var config = require('./config/config.js');

server.listen(config.server.port);

