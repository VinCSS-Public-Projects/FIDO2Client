const { FIDO2Client, FIDO2Crypto } = require('../../dist/index');
const { question } = require('readline-sync');

const client = new FIDO2Client({
    defaultModal: false,
    event: {
        onRequest: async (req) => {
            console.log(req);
            return true;
        },
        onDeviceAttached: async (device) => {
            console.log('new device attached', device);
            return device;
        },
        onEnterPin: async () => {
            let pin = question('PIN? ', { hideEchoBack: true })
            return pin;
        },
        onSuccess: () => {
            console.log('request success');
        },
        onKeepAlive: (status) => {
            console.log('keep alive with status', status);
        },
        onDeviceDetached: (device) => {
            console.log('device detached', device);
        },
        onPinInvalid: async (retries) => {
            console.log(`${retries} attempts left`);
            let pin = question('PIN? ', { hideEchoBack: true })
            return pin;
        },
        onKeepAliveCancel: () => {
            console.log('keep alive cancel');
        },
        onDeviceSelected: (info) => {
            console.log('device selected', info);
        },
        onPinAuthBlocked: () => {
            console.log('pinAuth blocked, please reinsert your key!!');
        },
        onPinBlocked: () => {
            console.log('pin blocked, please reset your key!!!!!');
        },
        onPinValid: () => {
            console.log('pin valid, nice');
        },
        onTimeout: () => {
            console.log('request timeout');
        },
        onSetPin: async () => {
            let pin = question('New PIN? ', { hideEchoBack: true })
            return pin;
        },
        onError: (e) => {
            console.log('error', e);
        }
    }
});

client.makeCredential('https://vincss.net', {
    publicKey: {
        rp: {
            name: 'vincss',
            id: 'vincss.net'
        },
        challenge: FIDO2Crypto.random(32),
        user: {
            name: 'test',
            displayName: 'Test',
            id: FIDO2Crypto.random(32),
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
        timeout: 100000
    }
}).then(cred => {
    console.log(cred);

    client.getAssertion('https://vincss.net', {
        publicKey: {
            rpId: 'vincss.net',
            challenge: FIDO2Crypto.random(32),
            allowCredentials: [
                {
                    id: cred.rawId,
                    type: 'public-key'
                }
            ],
            userVerification: 'required'
        }
    }).then(cred => {
        console.log(cred);
    });
});