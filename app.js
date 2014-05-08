//Bootstraping
var config = require('./config/config.js');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : config.mysql.host,
    database : config.mysql.database,
    user     : config.mysql.user,
    password : config.mysql.password
});
connection.connect();

var server = require('http').createServer();
server.listen(config.server.port);

var io = require('socket.io').listen(server);

var	validator = require('validator');

//Container
container = {
	'server' : server,
	'mysql' : mysql,
	'io' : io,
	'validator' : validator
}

//Application
var chat = require('./resources/chat.js');
chat.startSocketServer(container);

