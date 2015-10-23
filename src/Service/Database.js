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

    function reconnect(error) {
        var time = 2000;
        console.log(error);
        console.log('Re-connecting lost connection in ' + time + ' ms.');
        //setTimeout(checkConnection, 2000);
    }

    function checkConnection() {

        var connection = bookshelf.knex.client.acquireRawConnection();
        connection.then(function(conn) {

            console.info('info: mysql client connected to ' + conn.config.host);

            conn.on('error', function(error) {
                console.log('conn on error');
                reconnect(error);
            });

        }, function(error) {
            console.log('function error');
            reconnect(error);
        });
    }

    checkConnection();

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
