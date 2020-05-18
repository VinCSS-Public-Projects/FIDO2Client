const crypto = require('crypto');
const base64url = require('base64url');

module.exports.RandomBytes = (len) => {
    let randomData = crypto.randomBytes(len);
    return Buffer.from(randomData);
};

module.exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports.Base64URLEncode = (data) => {
    return base64url.encode(data);
};