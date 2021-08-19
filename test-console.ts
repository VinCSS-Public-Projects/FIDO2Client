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
            logger.debug('new device attached', device);
            return device;
        },
        onEnterPin: async () => {
            let pin = question('PIN? ', { hideEchoBack: true })
            return pin;
        },
        onSuccess: () => {
            logger.debug('request success');
        },
        onKeepAlive: (status) => {
            logger.debug('keep alive with status', status);
        },
        onDeviceDetached: (device) => {
            logger.debug('device detached', device);
        },
        onPinInvalid: async (retries) => {
            logger.debug(`${retries} attempts left`);
            let pin = question('PIN? ', { hideEchoBack: true })
            return pin;
        },
        onKeepAliveCancel: () => {
            logger.debug('keep alive cancel');
        },
        onDeviceSelected: (info) => {
            logger.debug('device selected', info);
        },
        onPinAuthBlocked: () => {
            logger.debug('pinAuth blocked, please reinsert your key!!');
        },
        onPinBlocked: () => {
            logger.debug('pin blocked, please reset your key!!!!!');
        },
        onPinValid: () => {
            logger.debug('pin valid, nice');
        },
        onTimeout: () => {
            logger.debug('request timeout');
        },
        onSetPin: async () => {
            let pin = question('New PIN? ', { hideEchoBack: true })
            return pin;
        },
        onError: (e) => {
            logger.debug('error', e);
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
        },
        timeout: 100000
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
    }).then(x => logger.debug(x));
});