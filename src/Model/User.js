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
                    profile: user.get('picture') ? '/media/cache/resolve/profile_picture/user/images/' + user.get('picture') : '/media/cache/resolve/profile_picture/bundles/qnoowweb/images/user-no-img.jpg'
                }
            }
        }
    }, {
        findUsersCanContactFrom: function(id) {
            return this
                .query()
                .select('users.id', 'users.username', 'users.email')
                .leftJoin('user_favorite as favorited_to', 'users.id', 'favorited_to.user_to')
                .leftJoin('chat_message as messages_sent', 'users.id', 'messages_sent.user_from')
                .leftJoin('chat_message as messages_received', 'users.id', 'messages_received.user_to')
                .leftJoin('user_block as blocked_from', 'users.id', 'blocked_from.user_from')
                .leftJoin('user_block as blocked_to', 'users.id', 'blocked_to.user_to')
                .where('users.id', '!=', id)
                .andWhere(function() {
                    this
                        .where('favorited_to.user_from', '=', id)
                        .orWhere('messages_sent.user_to', '=', id)
                        .orWhere('messages_received.user_from', '=', id)
                    ;
                })
                .andWhere(function() {
                    this
                        .whereNull('blocked_from.user_to')
                        .whereNull('blocked_to.user_from')
                })
                .groupBy('users.id')
                .orderBy('users.id', 'ASC');
        },
        findUsersCanContactTo  : function(id) {
            return this
                .query()
                .select('users.id', 'users.username', 'users.email')
                .leftJoin('user_favorite as favorited_from', 'users.id', 'favorited_from.user_from')
                .leftJoin('chat_message as messages_sent', 'users.id', 'messages_sent.user_from')
                .leftJoin('chat_message as messages_received', 'users.id', 'messages_received.user_to')
                .leftJoin('user_block as blocked_from', 'users.id', 'blocked_from.user_from')
                .leftJoin('user_block as blocked_to', 'users.id', 'blocked_to.user_to')
                .where('users.id', '!=', id)
                .andWhere(function() {
                    this
                        .where('favorited_from.user_to', '=', id)
                        .orWhere('messages_sent.user_to', '=', id)
                        .orWhere('messages_received.user_from', '=', id)
                    ;
                })
                .andWhere(function() {
                    this
                        .whereNull('blocked_from.user_to')
                        .whereNull('blocked_to.user_from')
                })
                .groupBy('users.id')
                .orderBy('users.id', 'ASC');
        },
        canContact             : function(from, to) {
            return this
                .query()
                .count('* as count')
                .first()
                .from('user_block')
                .where(function() {
                    this
                        .where('user_from', '=', from)
                        .andWhere('user_to', '=', to)
                })
                .orWhere(function() {
                    this
                        .where('user_from', '=', to)
                        .andWhere('user_to', '=', from)
                })
                .then(function(result) {
                    return result.count === 0;
                });
        }
    });

    bookshelf.model('User', User);

    return User;
};

module.exports = User;