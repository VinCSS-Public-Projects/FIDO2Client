"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fido2Crypto = void 0;
const crypto_1 = require("crypto");
const environment_1 = require("../../environment");
const common_1 = require("../errors/common");
class Fido2Crypto {
    static hash(message) {
        switch (environment_1.Fido2Spec) {
            case environment_1.Fido2SpecVersion.FIDO_2_1:
                return (0, crypto_1.createHash)('sha256').update(message).digest();
            default:
                throw new common_1.CommonFido2SpecNotImplemented();
        }
    }
    static hmac(key, message) {
        switch (environment_1.Fido2Spec) {
            case environment_1.Fido2SpecVersion.FIDO_2_1:
                return (0, crypto_1.createHmac)('sha256', key).update(message).digest();
            default:
                throw new common_1.CommonFido2SpecNotImplemented();
        }
    }
    static encrypt(key, message) {
        switch (environment_1.Fido2Spec) {
            case environment_1.Fido2SpecVersion.FIDO_2_1: {
                let cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', key, Buffer.alloc(16));
                return cipher.update(message);
            }
            default:
                throw new common_1.CommonFido2SpecNotImplemented();
        }
    }
    static decrypt(key, cipher) {
        switch (environment_1.Fido2Spec) {
            case environment_1.Fido2SpecVersion.FIDO_2_1: {
                let decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, Buffer.alloc(16));
                decipher.setAutoPadding(false);
                return decipher.update(cipher);
            }
            default:
                throw new common_1.CommonFido2SpecNotImplemented();
        }
    }
    static regenerate() {
        switch (environment_1.Fido2Spec) {
            case environment_1.Fido2SpecVersion.FIDO_2_1: {
                let key = (0, crypto_1.createECDH)('prime256v1');
                key.generateKeys();
                return { publicKey: key.getPublicKey(), privateKey: key.getPrivateKey() };
            }
            default:
                throw new common_1.CommonFido2SpecNotImplemented();
        }
    }
    static sharedSecretGeneration(privateKey, publicKey) {
        switch (environment_1.Fido2Spec) {
            case environment_1.Fido2SpecVersion.FIDO_2_1: {
                let key = (0, crypto_1.createECDH)('prime256v1');
                key.setPrivateKey(privateKey);
                return Fido2Crypto.hash(key.computeSecret(publicKey));
            }
            default:
                throw new common_1.CommonFido2SpecNotImplemented();
        }
    }
    static random(length) {
        return (0, crypto_1.randomBytes)(length);
    }
}
exports.Fido2Crypto = Fido2Crypto;
//# sourceMappingURL=crypto.js.map