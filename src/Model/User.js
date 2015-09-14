var User = function(bookshelf) {

    var User = bookshelf.Model.extend({
        tableName: 'users',
        toObject : function() {
            var user = this;
            return {
                id      : user.id,
                username: user.get('username'),
                email   : user.get('email'),
                image   : {
                    profile: user.get('picture') ? '/media/cache/resolve/profile_picture/user/images/' + user.get('picture') : '/media/cache/resolve/profile_picture/bundles/qnoowweb/images/user-no-img.jpg',
                    small  : user.get('picture') ? '/media/cache/resolve/user_avatar_60x60/user/images/' + user.get('picture') : '/media/cache/resolve/user_avatar_60x60/bundles/qnoowweb/images/user-no-img.jpg',
                    medium : user.get('picture') ? '/media/cache/resolve/user_avatar_180x180/user/images/' + user.get('picture') : '/media/cache/resolve/user_avatar_180x180/bundles/qnoowweb/images/user-no-img.jpg'
                }
            }
        }
    }, {});

    bookshelf.model('User', User);

    return User;
};

module.exports = User;