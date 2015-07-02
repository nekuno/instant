var UserManager = function(database) {

    this.database = database;
    this.users = {};
};

UserManager.prototype.find = function(id, callback) {

    var self = this;

    if (self.users[id]) {
        callback(self.users[id]);
        return;
    }

    var User = this.database.model('User');

    User
        .forge({id: id})
        .fetch()
        .then(function(user) {
            user = user.toObject();
            self.users[id] = user;
            callback(user);
        });

};

module.exports = UserManager;