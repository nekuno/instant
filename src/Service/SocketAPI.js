var SocketAPI = function(app, workersSocketManager, params) {

    app.get('/', function(req, res) {
        res.send('Welcome to the Nekuno Instant API!');
    });

    var oauthshim = require('oauth-shim');
    app.all('/oauthproxy', oauthshim);
    oauthshim.init([{
        client_id: params.oauthshim.client_id,
        client_secret: params.oauthshim.client_secret,
        grant_url: 'https://api.twitter.com/oauth/access_token',
        domain: 'http://client.local.nekuno.com/oauthcallback.html, http://m.nekuno.com/oauthcallback.html'
    }]);

    var express = require('express');
    var router = express.Router();

    router.post('/fetch/start', function(req, res) {
        var body = req.body;
        workersSocketManager.fetchStart(body.userId, body.resource);
        res.send();
    });

    router.post('/fetch/finish', function(req, res) {
        var body = req.body;
        workersSocketManager.fetchFinish(body.userId, body.resource);
        res.send();
    });

    router.post('/process/start', function(req, res) {
        var body = req.body;
        workersSocketManager.processStart(body.userId, body.resource);
        res.send();
    });

    router.post('/process/link', function(req, res) {
        var body = req.body;
        workersSocketManager.processLink(body.userId, body.resource, body.percentage);
        res.send();
    });

    router.post('/process/finish', function(req, res) {
        var body = req.body;
        workersSocketManager.processFinish(body.userId, body.resource);
        res.send();
    });

    router.post('/user/status', function(req, res) {
        var body = req.body;
        workersSocketManager.userStatus(body.userId, body.status);
        res.send();
    });

    app.use('/api', router);


};

module.exports = SocketAPI;