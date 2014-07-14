'use strict';

var Util = require('./Util');

var Container = function(dir, params, services) {

    var params = Util.loadYaml(params).parameters;

    this._config = Util.loadYaml(services, params).services;
    this._dir = dir;
    this._services = {
        params   : params,
        container: this
    };

    for (var name in this._config) {

        var service = this._config[name];
        var autorun = service.hasOwnProperty('autorun')
            ? service.autorun
            : false;

        if (autorun) {

            this.get(name);
        }
    }
};

Container.prototype.get = function(name) {

    if (this._services.hasOwnProperty(name)) {

        return this._services[name];
    }

    if (this._config.hasOwnProperty(name)) {

        this._services[name] = this._get(name);

        return this._services[name];
    }

    return null;
};

Container.prototype.add = function(name, service) {

    this._services[name] = service;

    return this;
};

Container.prototype.extractServices = function(method, args) {

    var self = this;
    args = args || {};

    return Util.getArgumentNames(method).map(function(service) {

        return args.hasOwnProperty(service) ? args[service] : self.get(service);
    });
};

Container.prototype.wire = function(Constructor, args, context) {

    if (Constructor.constructor === String) {

        Constructor = module.parent.require(Constructor);
    }

    args = this.extractServices(Constructor, args);

    if (context) {

        return Constructor.apply(context, args);
    }

    return Util.construct(Constructor, args);
};

Container.prototype._get = function(name) {

    var self = this;
    var args = [];
    var config = this._config[name];
    var service = config.class;
    var instantiate = config.hasOwnProperty('instantiate')
        ? config.instantiate
        : true;

    if (service.substring(0, 1) === '/') {

        service = this._dir + '/' + service;
    }

    if (!instantiate) {

        return module.parent.require(service);
    }

    if (config.hasOwnProperty('arguments')) {

        config.arguments.forEach(function(a) {

            if (a.substring(0, 1) === '@') {

                a = self.get(a.substring(1));
            }

            args.push(a);
        });

        return Util.construct(service, args);
    }

    return this.wire(service);
};

module.exports = Container;