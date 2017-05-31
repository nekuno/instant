var request = require('request-promise');

var PushNotificationsManager = function(database, params) {
    this.database = database;
    this.base_url = params.brain.base_url;
};

PushNotificationsManager.prototype.notify = function(userId, category, data) {

    var options = {
        method: 'POST',
        uri: this.base_url + 'instant/notify',
        body: {
            userId: userId,
            category: category,
            data: data
        },
        json: true
    };

    return request(options)
        .then(function(notification) {
            console.log(notification);
        })
        .error(function(error) {
            console.log(error);
        });

};


module.exports = PushNotificationsManager;