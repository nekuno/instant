var request = require('request-promise');
var Promise = require('bluebird');

var UserManager = function(database, params) {

    this.database = database;
    this.users = {};
    this.base_url = params.brain.base_url;
};

UserManager.prototype.find = function(id) {

    var self = this;

    if (self.users[id]) {
        return new Promise(function(resolve) {
            resolve(self.users[id]);
        });
    }

    var User = this.database.model('User');

    return User
        .forge({id: id})
        .fetch()
        .then(function(user) {
            user = user.toObject();
            self.users[id] = user;
            return user;
        });

};

UserManager.prototype.findUsersCanContactFrom = function(id) {

    var self = this;

    return request({uri: this.base_url + 'users/' + id + '/contact/from', json: true})
        .then(function(users) {
            var all = [];
            users.forEach(function(user) {
                all.push(self.find(user));
            });
            return Promise.all(all);
        });
};

UserManager.prototype.findUsersCanContactTo = function(id) {

    var self = this;

    return request({uri: this.base_url + 'users/' + id + '/contact/to', json: true})
        .then(function(users) {
            var all = [];
            users.forEach(function(user) {
                all.push(self.find(user));
            });
            return Promise.all(all);
        });
};

UserManager.prototype.canContact = function(from, to) {

    return request({uri: this.base_url + 'users/' + from + '/contact/' + to, json: true})
        .then(function() {
            return true;
        })
        .catch(function() {
            return false;
        });
};

module.exports = UserManager;