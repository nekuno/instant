module.exports = function (database) {
	
	var message = database.Model.extend({
		tableName: 'chat'
	});

    return message;
}