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

    return request({uri: this.base_url + 'users/' + id, json: true})
        .then(function(user) {
            user = self._toObject(user);
            self.users[id] = user;
            return user;
        });

};

UserManager.prototype.findByToken = function(token) {

    var self = this;

    return request({uri: this.base_url + 'users/find?salt=' + token, json: true})
        .then(function(user) {
            return self._toObject(user);
        });

};

UserManager.prototype._toObject = function(user) {
    return {
        id      : user.qnoow_id,
        username: user.username,
        email   : user.email,
        image   : {
            profile: user.picture ? '/media/cache/resolve/profile_picture/user/images/' + user.picture : '/media/cache/resolve/profile_picture/bundles/qnoowweb/images/user-no-img.jpg',
            small  : user.picture ? '/media/cache/resolve/user_avatar_60x60/user/images/' + user.picture : '/media/cache/resolve/user_avatar_60x60/bundles/qnoowweb/images/user-no-img.jpg',
            medium : user.picture ? '/media/cache/resolve/user_avatar_180x180/user/images/' + user.picture : '/media/cache/resolve/user_avatar_180x180/bundles/qnoowweb/images/user-no-img.jpg'
        }
    }
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