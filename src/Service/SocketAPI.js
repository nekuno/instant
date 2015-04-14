var SocketAPI = function(app, workersSocketManager) {

    app.get('/', function(req, res) {
        res.send('Welcome to the Nekuno Instant API!');
    });

    var express = require('express');
    var router = express.Router();

    router.post('/fetch', function(req, res) {
        var body = req.body;
        workersSocketManager.fetch(body.userId, body.resource, body.percentage);
        res.send();
    });
    router.post('/process', function(req, res) {
        var body = req.body;
        workersSocketManager.process(body.userId, body.resource, body.percentage);
        res.send();
    });

    app.use('/api', router);


};

module.exports = SocketAPI;