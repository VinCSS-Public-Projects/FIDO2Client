"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientPinV1 = exports.COSEKey = void 0;
const crypto_1 = require("crypto");
const environment_1 = require("../../environment");
const crypto_2 = require("../crypto/crypto");
var COSEKeyName;
(function (COSEKeyName) {
    COSEKeyName[COSEKeyName["kty"] = 1] = "kty";
    COSEKeyName[COSEKeyName["alg"] = 3] = "alg";
    COSEKeyName[COSEKeyName["crv"] = -1] = "crv";
    COSEKeyName[COSEKeyName["x"] = -2] = "x";
    COSEKeyName[COSEKeyName["y"] = -3] = "y";
})(COSEKeyName || (COSEKeyName = {}));
class COSEKey {
    initialize(key) {
        /**
         * @TODO fix me
         */
        this.kty = 2;
        this.alg = -25;
        this.crv = 1;
        this.x = Buffer.alloc(32);
        this.y = Buffer.alloc(32);
        key.copy(this.x, 0, 1, 33);
        key.copy(this.y, 0, 33, 66);
        return this;
    }
    serialize() {
        let map = new Map();
        map.set(COSEKeyName.kty, this.kty);
        map.set(COSEKeyName.alg, this.alg);
        map.set(COSEKeyName.crv, this.crv);
        map.set(COSEKeyName.x, this.x);
        map.set(COSEKeyName.y, this.y);
        return map;
    }
    deserialize(payload) {
        this.kty = payload.get(COSEKeyName.kty);
        this.alg = payload.get(COSEKeyName.alg);
        this.crv = payload.get(COSEKeyName.crv);
        this.x = payload.get(COSEKeyName.x);
        this.y = payload.get(COSEKeyName.y);
        return this;
    }
}
exports.COSEKey = COSEKey;
class ClientPinV1 {
    constructor() {
        this.initialize();
        this.version = environment_1.ClientPinVersion.v1;
    }
    ecdh(peerCoseKey) {
        return this.kdf(this.key.computeSecret(Buffer.concat([Buffer.alloc(1, 0x4), peerCoseKey.x, peerCoseKey.y])));
    }
    kdf(z) {
        return crypto_2.Fido2Crypto.hash(z);
    }
    initialize() {
        this.key = crypto_1.createECDH('prime256v1');
        this.key.generateKeys();
    }
    encapsulate(peerCoseKey) {
        this.key.generateKeys();
        return {
            platformKeyAgreement: new COSEKey().initialize(this.key.getPublicKey()),
            sharedSecret: this.ecdh(peerCoseKey)
        };
    }
    decapsulate(peerCoseKey) {
        return this.ecdh(peerCoseKey);
    }
    encrypt(key, plaintext) {
        return crypto_2.Fido2Crypto.encrypt(key, plaintext);
    }
    decrypt(key, ciphertext) {
        return crypto_2.Fido2Crypto.decrypt(key, ciphertext);
    }
    authenticate(key, message) {
        return crypto_2.Fido2Crypto.hmac(key, message).slice(0, 16);
    }
}
exports.ClientPinV1 = ClientPinV1;
//# sourceMappingURL=client-pin.js.map