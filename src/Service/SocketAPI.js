var SocketAPI = function(app, workersSocketManager, chatSocketManager, userManager, params) {

    app.get('/', function(req, res) {
        res.send('Welcome to the Nekuno Instant API!');
    });

    var oauthshim = require('oauth-shim');
    app.all('/oauthproxy', oauthshim);
    oauthshim.init([{
        client_id    : params.oauthshim.twitter.client_id,
        client_secret: params.oauthshim.twitter.client_secret,
        grant_url    : params.oauthshim.twitter.grant_url,
        domain       : 'http://client.local.nekuno.com/oauthcallback.html, https://client.local.nekuno.com/oauthcallback.html, http://m.pre.nekuno.com/oauthcallback.html, https://m.pre.nekuno.com/oauthcallback.html, http://m.nekuno.com/oauthcallback.html, https://m.nekuno.com/oauthcallback.html'
    }, {
        client_id    : params.oauthshim.facebook.client_id,
        client_secret: params.oauthshim.facebook.client_secret,
        grant_url    : params.oauthshim.facebook.grant_url,
        domain       : 'http://client.local.nekuno.com/oauthcallback.html, https://client.local.nekuno.com/oauthcallback.html, http://m.pre.nekuno.com/oauthcallback.html, https://m.pre.nekuno.com/oauthcallback.html, http://m.nekuno.com/oauthcallback.html, https://m.nekuno.com/oauthcallback.html'
    }, {
        client_id    : params.oauthshim.google.client_id,
        client_secret: params.oauthshim.google.client_secret,
        grant_url    : params.oauthshim.google.grant_url,
        domain       : 'http://client.local.nekuno.com/oauthcallback.html, https://client.local.nekuno.com/oauthcallback.html, http://m.pre.nekuno.com/oauthcallback.html, https://m.pre.nekuno.com/oauthcallback.html, http://m.nekuno.com/oauthcallback.html, https://m.nekuno.com/oauthcallback.html'
    }, {
        client_id    : params.oauthshim.spotify.client_id,
        client_secret: params.oauthshim.spotify.client_secret,
        grant_url    : params.oauthshim.spotify.grant_url,
        domain       : 'http://client.local.nekuno.com/oauthcallback.html, https://client.local.nekuno.com/oauthcallback.html, http://m.pre.nekuno.com/oauthcallback.html, https://m.pre.nekuno.com/oauthcallback.html, http://m.nekuno.com/oauthcallback.html, https://m.nekuno.com/oauthcallback.html'
    }, {
        client_id    : params.oauthshim.tumblr.client_id,
        client_secret: params.oauthshim.tumblr.client_secret,
        grant_url    : params.oauthshim.tumblr.grant_url,
        domain       : 'http://client.local.nekuno.com/oauthcallback.html, https://client.local.nekuno.com/oauthcallback.html, http://m.pre.nekuno.com/oauthcallback.html, https://m.pre.nekuno.com/oauthcallback.html, http://m.nekuno.com/oauthcallback.html, https://m.nekuno.com/oauthcallback.html'
    }, {
        client_id    : params.oauthshim.linkedin.client_id,
        client_secret: params.oauthshim.linkedin.client_secret,
        grant_url    : params.oauthshim.linkedin.grant_url,
        domain       : 'http://client.local.nekuno.com/oauthcallback.html, https://client.local.nekuno.com/oauthcallback.html, http://m.pre.nekuno.com/oauthcallback.html, https://m.pre.nekuno.com/oauthcallback.html, http://m.nekuno.com/oauthcallback.html, https://m.nekuno.com/oauthcallback.html'
    }]);

    var express = require('express');
    var router = express.Router();

    /** Auth Middleware **/
    router.use(function (req, res, next) {
        if (req.headers.authorization) {
            var auth = new Buffer(req.headers.authorization.split(" ")[1], 'base64').toString();
            var username = auth.split(':')[0];
            var pass = auth.split(':')[1];
            if (username === 'brain' && pass === params.api_secret) {
                next();
            } else {
                res.status(500).send('Bad credentials');
            }
        } else {
            res.status(500).send('You cannot access this server');
        }
    });
    /** End middleware **/

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

    router.post('/similarity/start', function(req, res) {
        var body = req.body;
        workersSocketManager.similarityStart(body.userId, body.processId);
        res.send();
    });

    router.post('/similarity/step', function(req, res) {
        var body = req.body;
        workersSocketManager.similarityStep(body.userId, body.processId, body.percentage);
        res.send();
    });

    router.post('/similarity/finish', function(req, res) {
        var body = req.body;
        workersSocketManager.similarityFinish(body.userId, body.processId);
        res.send();
    });

    router.post('/matching/start', function(req, res) {
        var body = req.body;
        workersSocketManager.matchingStart(body.userId, body.processId);
        res.send();
    });

    router.post('/matching/step', function(req, res) {
        var body = req.body;
        workersSocketManager.matchingStep(body.userId, body.processId, body.percentage);
        res.send();
    });

    router.post('/matching/finish', function(req, res) {
        var body = req.body;
        workersSocketManager.matchingFinish(body.userId, body.processId);
        res.send();
    });

    router.post('/affinity/start', function(req, res) {
        var body = req.body;
        workersSocketManager.affinityStart(body.userId, body.processId);
        res.send();
    });

    router.post('/affinity/step', function(req, res) {
        var body = req.body;
        workersSocketManager.affinityStep(body.userId, body.processId, body.percentage);
        res.send();
    });

    router.post('/affinity/finish', function(req, res) {
        var body = req.body;
        workersSocketManager.affinityFinish(body.userId, body.processId);
        res.send();
    });

    router.post('/user/status', function(req, res) {
        var body = req.body;
        workersSocketManager.userStatus(body.userId, body.status);
        res.send();
    });

    router.post('/user/clear', function(req, res) {
        var body = req.body;
        userManager.clearUser(body.userId).then(function() {
            res.send();
        }, function(status) {
            console.log(status);
        });

    });

    router.post('/message', function(req, res) {
        var body = req.body;
        chatSocketManager.message(body.userFromId, body.userToId, body.text);
        res.send();
    });

    router.delete('/user/messages', function(req, res) {
        var body = req.body;
        chatSocketManager.deleteAllFromUser(body.userId);
        res.send();
    });

    app.use('/api', router);

};

module.exports = SocketAPI;