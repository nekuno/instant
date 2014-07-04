var Database = function(params) {

    var bookshelf = require('bookshelf');
    bookshelf.database = bookshelf.initialize({
        client    : 'mysql',
        connection: {
            host    : params.mysql.host,
            user    : params.mysql.user,
            password: params.mysql.password,
            database: params.mysql.database,
            charset : 'UTF8_GENERAL_CI'
        }
    });

    bookshelf.database.knex.client.getRawConnection()
        .then(function(connection) {
            console.info('   info  - mysql client connected to ' + connection.config.host);
        }).error(function(error) {
            console.log(error.name, error.message);
            process.exit();
        });

    return bookshelf.database;

};

module.exports = Database;
