var request = require('request-promise');

var PushNotificationsManager = function(database, params) {
    this.database = database;
    this.base_url = params.brain.base_url;
    this.http_username = params.brain.http_username;
    this.http_password = params.brain.http_password;
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
        json: true,
        headers: {
            Authorization: 'Basic ' + Buffer.from(this.http_username + ':' + this.http_password).toString('base64')
        }
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