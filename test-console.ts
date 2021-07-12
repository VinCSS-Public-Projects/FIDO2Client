import { FIDO2Client } from './index';
import { Fido2Crypto } from './src/crypto/crypto';
import { logger } from './src/log/debug';
import { question } from 'readline-sync';

const client = new FIDO2Client({
    defaultModal: false,
    event: {
        onRequest: async (req) => {
            logger.debug(req);
            return true;
        },
        onDeviceAttached: async (device) => {
            return device;
        },
        onEnterPin: async () => {
            let pin = question('PIN? ', { hideEchoBack: true })
            return pin;
        }
    }
});

client.makeCredential('https://webauthn.cybersecvn.com', {
    publicKey: {
        rp: {
            name: 'vincss',
            id: 'webauthn.cybersecvn.com'
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

    client.getAssertion('https://webauthn.cybersecvn.com', {
        publicKey: {
            rpId: 'webauthn.cybersecvn.com',
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