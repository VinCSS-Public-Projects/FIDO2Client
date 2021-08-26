import { expect } from "chai";
import { Fido2ClientErrCancel, Fido2ClientErrNotAllowed, Fido2ClientErrTimeout } from "..";
import { FIDO2Client, IFido2DeviceInfo } from '..';
import { Fido2Crypto } from "../src/crypto/crypto";

describe('Events', () => {

    it('pin available on environment', () => {
        expect(process.env.PIN).to.be.an('string');
        expect(process.env.PIN).to.have.lengthOf.above(3);
    });

    describe('console', () => {
        describe('onRequest - insert and touch your security key', () => {
            it('deny', () => {
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            expect(req).to.be.an('object');
                            expect(req.rp).to.equal('vincss.net');
                            expect(req.process).to.equal('node.exe');
                            expect(req.publisher).to.equal('OpenJS Foundation');
                            expect(req.trusted).to.equal(true);
                            return false;
                        },
                        onDeviceAttached: async (device) => {
                            return device;
                        },
                        onEnterPin: async () => {
                            return process.env.PIN || '';
                        }
                    }
                });

                return client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        }
                    }
                } as any).catch(x => {
                    expect(x).to.be.an.instanceof(Fido2ClientErrNotAllowed);
                });
            });

            it('accept', async () => {
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            expect(req).to.be.an('object');
                            expect(req.rp).to.equal('vincss.net');
                            expect(req.process).to.equal('node.exe');
                            expect(req.publisher).to.equal('OpenJS Foundation');
                            expect(req.trusted).to.equal(true);
                            return true;
                        },
                        onDeviceAttached: async (device) => {
                            return device;
                        },
                        onEnterPin: async () => {
                            return process.env.PIN || '';
                        }
                    }
                });
                const x = await client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        }
                    }
                } as any);
                expect(x.id).to.be.an('string');
                expect(x.rawId instanceof ArrayBuffer).to.equal(true);
                expect(x.type).to.equal('public-key');
                expect((x.response as AuthenticatorAttestationResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
                expect((x.response as AuthenticatorAttestationResponse).attestationObject instanceof ArrayBuffer).to.equal(true);
            });
        });

        describe('onDeviceAttached - insert and touch your security key', () => {
            it('connect', () => {
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            return true;
                        },
                        onDeviceAttached: async (device) => {
                            expect(device).to.be.an('object');
                            expect(['ble', 'nfc', 'usb']).to.include(device.transport);
                            expect(device).to.have.any.keys(['uuid', 'path', 'name']);
                            return device;
                        },
                        onEnterPin: async () => {
                            return process.env.PIN || '';
                        }
                    }
                });
                return client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        }
                    }
                } as any).then(x => {
                    expect(x.id).to.be.an('string');
                    expect(x.rawId instanceof ArrayBuffer).to.equal(true);
                    expect(x.type).to.equal('public-key');
                    expect((x.response as AuthenticatorAttestationResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
                    expect((x.response as AuthenticatorAttestationResponse).attestationObject instanceof ArrayBuffer).to.equal(true);
                });
            });
        });

        describe('onDeviceDetached - reinsert your security key and waiting for timeout', () => {
            it('disconnect', () => {
                let gDetach: number = 0;
                let gAttach: number = 0;
                let gTime = Date.now();
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            return true;
                        },
                        onDeviceAttached: async (device) => {
                            console.log('attach');
                            gAttach++;
                        },
                        onDeviceDetached: (device) => {
                            console.log('detach');
                            gDetach++;
                        },
                        onEnterPin: async () => {
                            return process.env.PIN || '';
                        }
                    }
                });
                return client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        timeout: 20000
                    }
                } as any).catch(x => {
                    console.log(x)
                    expect(x).to.be.an.instanceof(Fido2ClientErrCancel);
                    expect(Date.now() - gTime).to.closeTo(20000, 2000);
                    expect(gDetach).to.equal(1);
                    expect(gAttach).to.equal(2);
                });
            });
        });

        describe('onDeviceSelected - insert and touch your security key', () => {
            it('selected', () => {
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            return true;
                        },
                        onDeviceAttached: async (device) => {
                            return device;
                        },
                        onDeviceSelected: (info) => {
                            expect(info).to.be.an('object').and;
                            expect(info).to.have.any.keys(['uv', 'uvRetries', 'clientPin', 'pinRetries']);
                            if (typeof info.clientPin === 'boolean') {
                                expect(info.clientPin).to.be.a('boolean');
                                expect(info.pinRetries).to.be.a('number');
                                expect(info.pinRetries).to.be.greaterThanOrEqual(0);
                            }
                            if (typeof info.uv === 'boolean') {
                                expect(info.uv).to.be.a('boolean');
                                expect(info.uvRetries).to.be.a('number');
                                expect(info.uvRetries).to.be.greaterThanOrEqual(0);
                            }
                        },
                        onEnterPin: async () => {
                            return process.env.PIN || '';
                        }
                    }
                });
                return client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        timeout: 10000
                    }
                } as any).then(x => {
                    expect(x.id).to.be.a('string');
                    expect(x.rawId instanceof ArrayBuffer).to.equal(true);
                    expect(x.type).to.equal('public-key');
                    expect((x.response as AuthenticatorAttestationResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
                    expect((x.response as AuthenticatorAttestationResponse).attestationObject instanceof ArrayBuffer).to.equal(true);
                });
            });
        });



        describe('onSuccess - insert and touch your security key', () => {
            it('success', () => {
                let gSuccess: number = 0;
                let gValid: number = 0;
                let gInfo: IFido2DeviceInfo;
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            return true;
                        },
                        onDeviceAttached: async (device) => {
                            return device;
                        },
                        onDeviceSelected: (info) => {
                            gInfo = info;
                        },
                        onSuccess: () => {
                            gSuccess++;
                        },
                        onPinValid: () => {
                            gValid++;
                        },
                        onEnterPin: async () => {
                            return process.env.PIN || '';
                        }
                    }
                });
                return client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        timeout: 10000
                    }
                } as any).then(x => {
                    expect(x.id).to.be.a('string');
                    expect(x.rawId instanceof ArrayBuffer).to.equal(true);
                    expect(x.type).to.equal('public-key');
                    expect((x.response as AuthenticatorAttestationResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
                    expect((x.response as AuthenticatorAttestationResponse).attestationObject instanceof ArrayBuffer).to.equal(true);
                    expect(gSuccess).to.equal(1);
                    if (!gInfo.uv) expect(gValid).to.equal(1);
                });
            });

        });

        describe('onPinAuthBlocked - insert and touch your security key', () => {
            it('lock clientPin', () => { });
            it('unlock clientPin', () => { });
            it('validate unlock clientPin', () => { });
            it('lock uv', () => { });
            it('unlock uv', () => { });
            it('validate unlock uv', () => { });
        });

        describe('onPinBlocked - insert and touch your security key', () => {
            it('lock clientPin', () => { });
            it('unlock clientPin', () => { });
            it('validate unlock clientPin', () => { });
            it('lock uv', () => { });
            it('unlock uv', () => { });
            it('validate unlock uv', () => { });
        });

        describe('onKeepAlive - insert and touch your security key', () => {
            it('frequency', () => {
                let gCount: number = 0;
                let gStart: number = Date.now();
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            return true;
                        },
                        onDeviceAttached: async (device) => {
                            return device;
                        },
                        onKeepAlive: (status) => {
                            expect(status).to.be.a('number');
                            gCount++;
                        },
                        onSuccess: () => {
                            expect((Date.now() - gStart) / gCount).lessThanOrEqual(1600);
                        },
                        onEnterPin: async () => {
                            return Fido2Crypto.random(8).toString('hex');
                        }
                    }
                });
                return client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        timeout: 10000
                    }
                } as any).then(x => {
                    expect(x.id).to.be.a('string');
                    expect(x.rawId instanceof ArrayBuffer).to.equal(true);
                    expect(x.type).to.equal('public-key');
                    expect((x.response as AuthenticatorAttestationResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
                    expect((x.response as AuthenticatorAttestationResponse).attestationObject instanceof ArrayBuffer).to.equal(true);
                });
            });
        });

        describe('onTimeout - insert your sec key and waiting for timeout (10000ms)', () => {
            it('timeout', () => {
                let gStart: number = Date.now();
                let gSuccess: number = 0;
                const client = new FIDO2Client({
                    defaultModal: false,
                    event: {
                        onRequest: async (req) => {
                            return true;
                        },
                        onDeviceAttached: async (device) => {
                            return device;
                        },
                        onTimeout: () => {
                            expect(Date.now() - gStart).to.closeTo(10000, 2000);
                        },
                        onSuccess: () => {
                            gSuccess++;
                        },
                        onEnterPin: async () => {
                            return Fido2Crypto.random(8).toString('hex');
                        }
                    }
                });
                return client.makeCredential('https://vincss.net', {
                    publicKey: {
                        rp: {
                            name: 'VinCSS',
                            id: 'vincss.net'
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
                        timeout: 10000
                    }
                } as any).then(() => {
                    expect(gSuccess).to.equal(0);
                }).catch(x => {
                    expect(x).to.be.an.instanceof(Fido2ClientErrCancel);
                });
            });
        });
    });

    describe('modal', () => {
        it('ok', () => {
        });
    });
});
