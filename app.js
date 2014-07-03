//Bootstraping
var config = require('./config/config.js');

var bookshelf  = require('bookshelf');
bookshelf.database = bookshelf.initialize({
  client: 'mysql',
  connection: {
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database,
    charset  : 'UTF8_GENERAL_CI'
  }
});

var server = require('http').createServer();
server.listen(config.server.port);

var io = require('socket.io').listen(server);

var	validator = require('validator');

//Container
container = {
	'server' : server,
	'database' : bookshelf.database,
	'io' : io,
	'validator' : validator
}

//Application
var chat = require('./app/chat.js');
chat.startSocketServer(container);


