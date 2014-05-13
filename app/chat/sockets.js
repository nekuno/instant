module.exports = {
	start: function (container) {
		var io = container['io'];
		var validator = container['validator'];

		var message = require('../../model/messages.js')(container['database']);

		var users = {};
		var listeners = {};

		io.sockets.on('connection', function (socket) {
		 
		    socket.on('set_online', function(user) {
		        socket.user = user;
		        users[user] = {'socket': socket.id, 'listening': []};
		        for(var i in listeners[user]) {
		            listener = listeners[user][i];
		            io.sockets.socket(users[listener]['socket']).emit('user_status', user, 'online');
		        }

		        message.collection().query(function(qb) {
  					qb
  						.whereRaw('`createdAt` >= DATE_SUB(NOW(), INTERVAL 60 MINUTE)')
  						.andWhere(function (sub) {
  							sub.where('user_to', user).orWhere('user_from', user)
  						}).orderBy('createdAt', 'DESC').limit(10);
				}).fetch().then(function(collection) {
					collection.each(function (item) {
						var recipient = "";
						var type = "";
						if(item.get('user_from')==user) {
							recipient = item.get('user_to');
							type = "out";
						} else {
							recipient = item.get('user_from');
							type = "in";
						}
						socket.emit('update_chat', recipient, item.get('text'), type, item.get('createdAt'));
						item.set('readed', 1);
						item.save();
					});
				});
		    });

		    socket.on('check_user', function(target) {
		        users[socket.user]['listening'].push(target);
		        if (!listeners[target])
		            listeners[target] = [];
		        listeners[target].push(socket.user);
		        if (users[target]) {
		            status = "online";
		        } else {
		            status = "offline";
		        }
		        socket.emit('user_status', target, status);
		    });

		    socket.on('send_message', function (user_to, messageText) {
		        var user_from = socket.user;
		        var readed = 0;
		        var messageTextEscaped = validator.escape(messageText);
		        var timestamp = new Date();
		        if (users[user_to]) {
		            io.sockets.socket(users[user_to]['socket']).emit('update_chat', user_from, messageTextEscaped, 'in', timestamp.toISOString());
		            readed = 1;
		        }
		        if (users[user_from]) {
		            io.sockets.socket(users[user_from]['socket']).emit('update_chat', user_to, messageTextEscaped,'out', timestamp.toISOString());
		        }
		        message.forge({
		        	'user_from': user_from,
		        	'user_to' : user_to,
		        	'text' : messageTextEscaped,
		        	'readed' : readed,
		        	'createdAt' : timestamp
		        }).save();
		    });

		    socket.on('disconnect', function() {
		        //Notify listeners
		        for(var i in listeners[socket.user]) {
		            listener = listeners[socket.user][i];
		            console.log('l'+listener);
		            io.sockets.socket(users[listener]['socket']).emit('user_status', socket.user, 'offline');
		        }
		        //delete users and his suscriptions
		        if (users[socket.user]) {
		            for (var i in users[socket.user]['listening']) {
		                listening = users[socket.user]['listening'][i];
		                delete listeners[listening][socket.user];
		            }
		            delete users[socket.user];
		        }
		    });
		});
	}
};