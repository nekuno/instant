module.exports = {
    exists: function() {

        var fs = require('fs');
        return fs.existsSync(__dirname + '/params.yml');
    },
    copy  : function(callback) {

        var readline = require('readline');
        var fstools = require('fs-tools');

        var rl = readline.createInterface({
            input : process.stdin,
            output: process.stdout
        });

        rl.question('Do you want to copy the params.yml.dist (y/n)? ', function(answer) {

            if (['s', 'S', 'y', 'Y'].indexOf(answer) !== -1) {
                console.log('Copying...', __dirname + '/params.yml.dist to ' + __dirname + '/params.yml');
                fstools.copy(__dirname + '/params.yml.dist', __dirname + '/params.yml', function(error) {
                    error ? console.error(error) : console.log('Done!');
                    callback();
                });
            } else {
                callback();
            }
        });
    }
};