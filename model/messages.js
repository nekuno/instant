module.exports = function (database) {
	
	var message = database.Model.extend({
		tableName: 'chat_message'
	});

    return message;
}