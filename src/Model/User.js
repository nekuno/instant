var User = function(bookshelf) {

    var User = bookshelf.Model.extend({
        tableName: 'users'
    });

    bookshelf.model('User', User);

    return User;
};

module.exports = User;