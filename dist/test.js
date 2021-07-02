"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const crypto_1 = require("./src/crypto/crypto");
const debug_1 = require("./src/log/debug");
const client = new index_1.FIDO2Client({
    defaultModal: false,
    event: {
        onRequest: async (req) => {
            debug_1.logger.debug(req);
            return true;
        },
        onDeviceAttached: async (device) => {
            debug_1.logger.debug(device);
            return device;
        },
        onEnterPin: async () => {
            return '1122';
        }
    }
});
client.makeCredential('https://sso-fido2-stg.vincss.net', {
    publicKey: {
        rp: {
            name: 'localhost',
            id: 'sso-fido2-stg.vincss.net'
        },
        challenge: crypto_1.Fido2Crypto.random(32),
        user: {
            name: 'test',
            displayName: 'Test',
            id: crypto_1.Fido2Crypto.random(32),
            icon: 'icon'
        },
        pubKeyCredParams: [
            {
                alg: -7,
                type: 'public-key'
            }, {
                type: "public-key",
                alg: -257
            }
        ],
        authenticatorSelection: {
            userVerification: "required"
        },
        extensions: {
            hmacCreateSecret: true
        }
    }
}).then(x => {
    debug_1.logger.debug(x);
    client.release();
    // client.getAssertion('https://webauthn.vincss.net', {
    // publicKey: {
    //     rpId: 'webauthn.vincss.net',
    //     challenge: Fido2Crypto.random(32),
    //     allowCredentials: [
    //         {
    //             id: x.rawId,
    //             type: 'public-key'
    //         }
    //     ],
    //     userVerification: 'required',
    //     extensions: {
    //         hmacGetSecret: {
    //             salt1: Fido2Crypto.hash(Buffer.from('salt1')),
    //             salt2: Fido2Crypto.hash(Buffer.from('salt2')),
    //         }
    //     }
    // }
}); //.then(y => logger.debug(y.clientExtensionResults));
