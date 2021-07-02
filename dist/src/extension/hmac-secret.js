"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmacSecretOutput = exports.HmacSecretInput = exports.HmacSecretExtIdentifier = void 0;
const client_1 = require("../errors/client");
exports.HmacSecretExtIdentifier = 'hmac-secret';
;
var HmacSecretExtName;
(function (HmacSecretExtName) {
    HmacSecretExtName[HmacSecretExtName["keyAgreement"] = 1] = "keyAgreement";
    HmacSecretExtName[HmacSecretExtName["saltEnc"] = 2] = "saltEnc";
    HmacSecretExtName[HmacSecretExtName["saltAuth"] = 3] = "saltAuth";
    HmacSecretExtName[HmacSecretExtName["pinUvAuthProtocol"] = 4] = "pinUvAuthProtocol";
})(HmacSecretExtName || (HmacSecretExtName = {}));
class HmacSecretInput {
    constructor(clientPin) {
        this.clientPin = clientPin;
    }
    make(hmacCreateSecret) {
        this.hmacCreateSecret = hmacCreateSecret;
        return this;
    }
    get(salt1, salt2) {
        if (salt1.length !== 32)
            throw new client_1.Fido2ClientErrInvalidParameter('extensions.hmacGetSecret.salt1');
        if (salt2 && salt2.length !== 32)
            throw new client_1.Fido2ClientErrInvalidParameter('extensions.hmacGetSecret.salt2');
        this.hmacGetSecret = { salt1: salt1, salt2: salt2 };
        return this;
    }
    async build() {
        if (this.hmacCreateSecret !== undefined && typeof this.hmacCreateSecret === 'boolean') {
            return this.hmacCreateSecret;
        }
        if (this.hmacCreateSecret !== undefined)
            throw new client_1.Fido2ClientErrInvalidParameter('extensions.hmacCreateSecret');
        if (this.hmacGetSecret !== undefined) {
            let map = new Map();
            let capsulate = this.clientPin.console.encapsulate(await this.clientPin.getKeyAgreement());
            let saltEnc = this.clientPin.console.encrypt(capsulate.sharedSecret, Buffer.concat([this.hmacGetSecret.salt1, this.hmacGetSecret.salt2 || Buffer.alloc(0)]));
            map.set(HmacSecretExtName.keyAgreement, capsulate.platformKeyAgreement.serialize());
            map.set(HmacSecretExtName.saltEnc, saltEnc);
            map.set(HmacSecretExtName.saltAuth, this.clientPin.console.authenticate(capsulate.sharedSecret, saltEnc));
            map.set(HmacSecretExtName.pinUvAuthProtocol, this.clientPin.version);
            return map;
        }
        throw new client_1.Fido2ClientErrInvalidParameter('extensions.hmacGetSecret');
    }
}
exports.HmacSecretInput = HmacSecretInput;
class HmacSecretOutput {
    constructor(clientPin) {
        this.clientPin = clientPin;
    }
    make(hmacCreateSecret) {
        this.hmacCreateSecret = hmacCreateSecret;
        return this;
    }
    get(output) {
        this.hmacGetSecret = output;
        return this;
    }
    async build() {
        if (this.hmacCreateSecret !== undefined && typeof this.hmacCreateSecret === 'boolean') {
            return this.hmacCreateSecret;
        }
        if (this.hmacCreateSecret !== undefined)
            throw new client_1.Fido2ClientErrInvalidParameter('extensions.hmacCreateSecret');
        if (this.hmacGetSecret !== undefined) {
            let sharedSecret = this.clientPin.console.decapsulate(await this.clientPin.getKeyAgreement());
            let output = this.clientPin.console.decrypt(sharedSecret, this.hmacGetSecret);
            let output1 = output.buffer.slice(output.byteOffset, output.byteOffset + 32);
            let result = { output1 };
            if (output.length === 64) {
                let output2 = output.buffer.slice(output.byteOffset + 32, output.byteOffset + 64);
                result.output2 = output2;
            }
            return result;
        }
        throw new client_1.Fido2ClientErrInvalidParameter('extensions.hmacGetSecret');
    }
}
exports.HmacSecretOutput = HmacSecretOutput;
