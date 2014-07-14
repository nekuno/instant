var Message = function(bookshelf) {

    var Message = bookshelf.Model.extend({
        tableName: 'chat_message'
    });

    bookshelf.model('Message', Message);

    return Message;
};

module.exports = Message;