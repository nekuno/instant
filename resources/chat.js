var sockets = require('./chat/sockets.js');

module.exports = {
	startSocketServer: function (server) {
		sockets.start(server);
	}
}