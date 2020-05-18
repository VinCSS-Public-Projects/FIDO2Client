const path = require('path');

/**
 *
 * @class {FIDO2Client}
 */
module.exports.FIDO2Client = require('./src/FIDO2Client/FIDO2Client').FIDO2Client;

/**
 *
 * @type {string}
 */
module.exports.PreloadPath = path.join(__dirname, './preload.js');

/**
 *
 * @type {string}
 */
module.exports.ProxyPath = path.join(__dirname, './proxy.js');