var Container = require('./Common/Container');

var container = new Container(
    __dirname,
        __dirname + '/config/params.yml',
        __dirname + '/config/services.yml'
);

container.get('kernel').run();