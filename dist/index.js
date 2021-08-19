"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreloadPath = exports.FIDO2Crypto = exports.Fido2DeviceCli = exports.FIDO2Client = void 0;
/**
 * Bootstrap, resolve modules alias.
 */
const path_1 = __importDefault(require("path"));
const module_alias_1 = require("module-alias");
module_alias_1.addAlias('@components', path_1.default.join(__dirname, 'src'));
module_alias_1.addAlias('@third_party', path_1.default.join(__dirname, 'third_party'));
/**
 * FIDO2 client modules.
 */
const client_1 = require("./src/client/client");
Object.defineProperty(exports, "FIDO2Client", { enumerable: true, get: function () { return client_1.Fido2Client; } });
const fido2_device_cli_1 = require("./src/fido2/fido2-device-cli");
Object.defineProperty(exports, "Fido2DeviceCli", { enumerable: true, get: function () { return fido2_device_cli_1.Fido2DeviceCli; } });
const crypto_1 = require("./src/crypto/crypto");
Object.defineProperty(exports, "FIDO2Crypto", { enumerable: true, get: function () { return crypto_1.Fido2Crypto; } });
__exportStar(require("./src/errors/client"), exports);
exports.PreloadPath = path_1.default.join(__dirname, 'preload.js');
