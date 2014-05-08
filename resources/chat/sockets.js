module.exports = {
	start: function (container) {
		var io = container['io'];
		var validator = container['validator'];

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

		    socket.on('send_message', function (user_to, message) {
		        user_from = socket.user;
		        if (users[user_to]) {
		            io.sockets.socket(users[user_to]['socket']).emit('update_chat', user_from, validator.escape(message),'in');    
		        }
		        if (users[user_from]) {
		            io.sockets.socket(users[user_from]['socket']).emit('update_chat', user_to, validator.escape(message),'out');
		        }
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