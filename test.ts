import { FIDO2Client } from './index';
import { Fido2Crypto } from './src/crypto/crypto';
import { logger } from './src/log/debug';

const client = new FIDO2Client({
    defaultModal: false,
    event: {
        onRequest: async (req) => {
            logger.debug(req);
            return true;
        },
        onDeviceAttached: async (device) => {
            logger.debug(device);
            return device;
        },
        onEnterPin: async () => {
            return '1122';
        }
    }
});

client.makeCredential('https://webauthn.vincss.net', {
    publicKey: {
        rp: {
            name: 'localhost',
            id: 'webauthn.vincss.net'
        },
        challenge: Fido2Crypto.random(32),
        user: {
            name: 'test',
            displayName: 'Test',
            id: Fido2Crypto.random(32),
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
    logger.debug(x);

    client.getAssertion('https://webauthn.vincss.net', {
        publicKey: {
            rpId: 'webauthn.vincss.net',
            challenge: Fido2Crypto.random(32),
            allowCredentials: [
                {
                    id: x.rawId,
                    type: 'public-key'
                }
            ],
            userVerification: 'required',
            extensions: {
                hmacGetSecret: {
                    salt1: Fido2Crypto.hash(Buffer.from('salt1')),
                    salt2: Fido2Crypto.hash(Buffer.from('salt2')),
                }
            }
        }
    });
});