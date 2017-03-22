var NotificationsSocketManager = function(io) {

    this.sockets = io.of('/notifications');
    this.sockets
        .on('connection', function(socket) {

            var user = socket.handshake.user;
            socket.join(user.id);
        });
};

NotificationsSocketManager.prototype.message = function(userId, slug, title, body, locale, icon) {
    icon = typeof icon !== 'undefined' && icon ? icon : 'https://nekuno.com/favicon-150.png';
    var lang = "en-US";
    if (locale && locale.indexOf("es") !== -1) {
        lang = "es-ES";
    }
    this.sockets.to(userId).emit('message', {slug: slug, title: title, body: body, lang: lang, icon: icon});
};

module.exports = NotificationsSocketManager;