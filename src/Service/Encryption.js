var crypto = require('crypto');

var Encryption = function(params) {

    const ENCRYPTION_KEY = params.encryption_password;
    const IV_LENGTH = 16; // For AES, this is always 16

    function encrypt(text) {
        var iv = crypto.randomBytes(IV_LENGTH);
        var cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
        var encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    function decrypt(text) {
        var textParts = text.split(':');
        var iv = new Buffer(textParts.shift(), 'hex');
        var encryptedText = new Buffer(textParts.join(':'), 'hex');

        console.log(ENCRYPTION_KEY + ": " + ENCRYPTION_KEY.length + " characters, " +
            Buffer.byteLength(ENCRYPTION_KEY, 'utf8') + " bytes");

        var decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
        var decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }

    return {
        encrypt: encrypt,
        decrypt: decrypt
    };
};

module.exports = Encryption;