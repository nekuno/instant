var sockets = require('./chat/sockets.js');

module.exports = {
	startSocketServer: function (container) {
		sockets.start(container);
	}
}