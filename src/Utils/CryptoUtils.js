const crypto = require('crypto');

/**
 *
 * @returns {{privateKey: Buffer, publicKey: Buffer}}
 */
module.exports.GenerateP256DHKeys = () => {
    let base = crypto.createECDH('prime256v1');
    base.generateKeys();
    return {privateKey: base.getPrivateKey(), publicKey: base.getPublicKey()}
};

/**
 *
 * @param platformPrivateKey {Buffer}
 * @param authenticatorPublicKey {Buffer}
 * @returns {Buffer}
 * @constructor
 */
module.exports.GenerateSharedSecret = (platformPrivateKey, authenticatorPublicKey) => {
    let base = crypto.createECDH('prime256v1');
    base.setPrivateKey(platformPrivateKey);
    let secret = base.computeSecret(authenticatorPublicKey);
    let hash = crypto.createHash('sha256');
    hash.update(secret);
    return hash.digest();
};

/**
 *
 * @param x {Buffer}
 * @param y {Buffer}
 * @returns {Buffer}
 * @constructor
 */
module.exports.COSEECDHAToPKCS = (x, y) => {
    let result = Buffer.alloc(1 + x.length + y.length);
    result[0] = 0x04;
    x.copy(result, 1);
    y.copy(result, 1 + x.length);
    return result;
};

/**
 *
 * @param key {Buffer}
 * @param message {Buffer}
 * @returns {Buffer}
 * @constructor
 */
module.exports.EncryptAES256IV0 = (key, message) => {
    let iv = Buffer.alloc(16).fill(0);
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    return cipher.update(message)
};

/**
 *
 * @param key {Buffer}
 * @param cipher {Buffer}
 * @returns {Buffer}
 * @constructor
 */
module.exports.DecryptAES256IV0 = (key, cipher) => {
    let iv = Buffer.alloc(16).fill(0);
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(false);
    return decipher.update(cipher);
};

/**
 *
 * @param key {Buffer}
 * @param message {Buffer}
 * @returns {Buffer}
 * @constructor
 */
module.exports.HMACSHA256 = (key, message) => {
    let hmac = crypto.createHmac('sha256', key);
    hmac.update(message);
    return hmac.digest();
};

/**
 *
 * @param message {Buffer}
 * @returns {Buffer}
 * @constructor
 */
module.exports.SHA256 = (message) => {
    let hash = crypto.createHash('sha256');
    hash.update(message);
    return hash.digest();
};
