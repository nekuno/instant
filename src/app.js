var check = require('./config/check.js');
if (!check.exists()) {
    console.error('params.yml file is not readable in config folder');
    check.copy(function() {
        process.exit();
    });
    return;
}

var Container = require('./Common/Container');

var container = new Container(
    __dirname,
    __dirname + '/config/params.yml',
    __dirname + '/config/services.yml'
);

container.get('kernel').run();