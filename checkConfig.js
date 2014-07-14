module.exports = {
    exists: function() {

        var fs = require('fs');
        return fs.existsSync('./config/config.js');
    },
    copy: function(callback) {

        var readline = require('readline');
        var fstools = require('fs-tools');

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Do you want to copy the config-example.js (y/n)? ', function(answer) {

            if (['s', 'S', 'y', 'Y'].indexOf(answer) !== -1) {
                console.log('Copying...');
                fstools.copy('./config/config-example.js', './config/config.js', function(error) {
                    error ? console.error(error) : console.log('Done!');
                    callback();
                });
            } else {
                callback();
            }
        });
    }
};