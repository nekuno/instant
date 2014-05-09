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
  						.whereRaw('`created_at` >= DATE_SUB(NOW(), INTERVAL 60 MINUTE)')
  						.andWhere('user_to', user).limit(10);
				}).fetch().then(function(collection) {
					collection.each(function (item) {
						socket.emit('update_chat', item.get('user_from'), item.get('message'), 'in', item.get('created_at'));
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
		        user_from = socket.user;
		        readed = 0;
		        messageTextEscaped = validator.escape(messageText);
		        if (users[user_to]) {
		            io.sockets.socket(users[user_to]['socket']).emit('update_chat', user_from, messageTextEscaped, 'in', Date());
		            readed = 1;
		        }
		        if (users[user_from]) {
		            io.sockets.socket(users[user_from]['socket']).emit('update_chat', user_to, messageTextEscaped,'out', Date());
		        }
		        message.forge({
		        	'user_from': user_from,
		        	'user_to' : user_to,
		        	'message' : messageTextEscaped,
		        	'readed' : readed
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