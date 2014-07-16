var fs = require('fs');
require('es6-shim');

var Database = function(params) {

    var knex = require('knex')({
        client    : 'mysql',
        connection: {
            host    : params.mysql.host,
            user    : params.mysql.user,
            password: params.mysql.password,
            database: params.mysql.database,
            charset : 'utf8'
        }
    });

    var bookshelf = require('bookshelf')(knex);
    bookshelf.plugin('registry');

    bookshelf.knex.client.acquireRawConnection()
        .then(function(connection) {
            console.info('info: mysql client connected to ' + connection.config.host);
        }).error(function(error) {
            console.log(error.name, error.message);
            process.exit();
        });

    // Bootstrap models
    var path = __dirname + '/../Model';

    fs.readdirSync(path).forEach(function(file) {

        if (!file.startsWith('.')) {

            require(path + '/' + file)(bookshelf);
        }
    });

    return bookshelf;

};

module.exports = Database;
