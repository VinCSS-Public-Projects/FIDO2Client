"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const crypto_1 = require("./src/crypto/crypto");
const debug_1 = require("./src/log/debug");
const readline_sync_1 = require("readline-sync");
const client = new index_1.FIDO2Client({
    defaultModal: false,
    event: {
        onRequest: async (req) => {
            debug_1.logger.debug(req);
            return true;
        },
        onDeviceAttached: async (device) => {
            debug_1.logger.debug('new device attached', device);
            return device;
        },
        onEnterPin: async () => {
            let pin = readline_sync_1.question('PIN? ', { hideEchoBack: true });
            return pin;
        },
        onSuccess: () => {
            debug_1.logger.debug('request success');
        },
        onKeepAlive: (status) => {
            debug_1.logger.debug('keep alive with status', status);
        },
        onDeviceDetached: (device) => {
            debug_1.logger.debug('device detached', device);
        },
        onPinInvalid: async (retries) => {
            debug_1.logger.debug(`${retries} attempts left`);
            let pin = readline_sync_1.question('PIN? ', { hideEchoBack: true });
            return pin;
        },
        onKeepAliveCancel: () => {
            debug_1.logger.debug('keep alive cancel');
        },
        onDeviceSelected: (info) => {
            debug_1.logger.debug('device selected', info);
        },
        onPinAuthBlocked: () => {
            debug_1.logger.debug('pinAuth blocked, please reinsert your key!!');
        },
        onPinBlocked: () => {
            debug_1.logger.debug('pin blocked, please reset your key!!!!!');
        },
        onPinValid: () => {
            debug_1.logger.debug('pin valid, nice');
        },
        onTimeout: () => {
            debug_1.logger.debug('request timeout');
        },
        onSetPin: async () => {
            let pin = readline_sync_1.question('New PIN? ', { hideEchoBack: true });
            return pin;
        },
        onError: (e) => {
            debug_1.logger.debug('error', e);
        }
    }
});
client.makeCredential('https://webauthn.cybersecvn.com', {
    publicKey: {
        rp: {
            name: 'vincss',
            id: 'webauthn.cybersecvn.com'
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
        },
        timeout: 100000
    }
}).then(x => {
    debug_1.logger.debug(x);
    client.getAssertion('https://webauthn.cybersecvn.com', {
        publicKey: {
            rpId: 'webauthn.cybersecvn.com',
            challenge: crypto_1.Fido2Crypto.random(32),
            allowCredentials: [
                {
                    id: x.rawId,
                    type: 'public-key'
                }
            ],
            userVerification: 'required',
            extensions: {
                hmacGetSecret: {
                    salt1: crypto_1.Fido2Crypto.hash(Buffer.from('salt1')),
                    salt2: crypto_1.Fido2Crypto.hash(Buffer.from('salt2')),
                }
            }
        }
    }).then(x => debug_1.logger.debug(x));
});
