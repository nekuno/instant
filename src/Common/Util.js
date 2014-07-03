var yaml = require('js-yaml');
var fs = require('fs');

var Util = {};

Util.read = function(path) {

    return fs.existsSync(path) ? fs.readFileSync(path, {encoding: 'utf8'}) : '';
};

Util.write = function(path, data) {

    return fs.writeFileSync(path, data);
};

Util.loadYaml = function(path, params) {

    var contents = Util.read(path)
        .replace(/@(\w+)/g, '"@$1"')
        .replace(/%(\w+)%/g, function(match, contents) {

            return '"' + eval('params.' + contents) + '"';
        });

    return yaml.safeLoad(contents);
};

Util.saveYaml = function(path, params) {

    var yml = yaml.safeDump(params);

    Util.write(path, yml);

};

Util.construct = function(constructor, args) {

    if (constructor.constructor === String) {

        constructor = module.parent.require(constructor);
    }

    var f = function() {

        return constructor.apply(this, args);
    };

    f.prototype = constructor.prototype;

    return new f();
};

Util.getArgumentNames = function(f) {

    var s = f
        .toString()
        .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');

    var names = s.slice(s.indexOf('(') + 1, s.indexOf(')'))
        .match(/([^\s,]+)/g);

    return names !== null ? names : [];
};

module.exports = Util;