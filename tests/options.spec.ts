import { expect } from 'chai';
import { FIDO2Client, Fido2ClientErrMissingParameter, Fido2ClientErrRelyPartyNotAllowed } from '..';
import { Fido2Crypto } from '../src/crypto/crypto';

describe('Options', () => {

    it('pin available on environment', () => {
        expect(process.env.PIN).to.be.an('string');
        expect(process.env.PIN).to.have.lengthOf.above(3);
    });

    describe('make options', () => {
        const client = new FIDO2Client({
            defaultModal: false,
            event: {
                onRequest: async (req) => {
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

        it('missing rp', () => client.makeCredential('https://vincss.net', {
            publicKey: {
                // rp: {
                //     name: 'VinCSS',
                //     id: 'vincss.net'
                // },
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
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member rp is undefined.');
        }));

        it('missing rp.name', () => client.makeCredential('https://vincss.net', {
            publicKey: {
                rp: {
                    // name: 'VinCSS',
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
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member rp.name is undefined.');
        }));

        it('missing challenge', () => client.makeCredential('https://vincss.net', {
            publicKey: {
                rp: {
                    name: 'VinCSS',
                    id: 'vincss.net'
                },
                // challenge: Fido2Crypto.random(32),
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
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member challenge is undefined.');
        }));

        it('missing user', () => client.makeCredential('https://vincss.net', {
            publicKey: {
                rp: {
                    name: 'VinCSS',
                    id: 'vincss.net'
                },
                challenge: Fido2Crypto.random(32),
                // user: {
                //     name: 'test',
                //     displayName: 'Test',
                //     id: Fido2Crypto.random(32),
                //     icon: 'icon'
                // },
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
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member user is undefined.');
        }));

        it('missing user.name', () => client.makeCredential('https://vincss.net', {
            publicKey: {
                rp: {
                    name: 'VinCSS',
                    id: 'vincss.net'
                },
                challenge: Fido2Crypto.random(32),
                user: {
                    // name: 'test',
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
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member user.name is undefined.');
        }));

        it('missing user.displayName', () => client.makeCredential('https://vincss.net', {
            publicKey: {
                rp: {
                    name: 'VinCSS',
                    id: 'vincss.net'
                },
                challenge: Fido2Crypto.random(32),
                user: {
                    name: 'test',
                    // displayName: 'Test',
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
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member user.displayName is undefined.');
        }));

        it('missing user.id', () => client.makeCredential('https://vincss.net', {
            publicKey: {
                rp: {
                    name: 'VinCSS',
                    id: 'vincss.net'
                },
                challenge: Fido2Crypto.random(32),
                user: {
                    name: 'test',
                    displayName: 'Test',
                    // id: Fido2Crypto.random(32),
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
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member user.id is undefined.');
        }));

        it('missing pubKeyCredParams', () => client.makeCredential('https://vincss.net', {
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
                // pubKeyCredParams: [
                //     {
                //         alg: -7,
                //         type: 'public-key'
                //     }, {
                //         type: "public-key",
                //         alg: -257
                //     }
                // ],
                authenticatorSelection: {
                    userVerification: "required"
                }
            }
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member pubKeyCredParams is undefined.');
        }));
    });

    describe('get options', () => {
        const client = new FIDO2Client({
            defaultModal: false,
            event: {
                onRequest: async (req) => {
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

        it('missing challenge', () => client.getAssertion('https://vincss.net', {
            publicKey: {
                rpId: 'https://vincss.net',
                // challenge: Fido2Crypto.random(32),
            }
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrMissingParameter).to.equal(true);
            expect(e.message).to.equal('required member challenge is undefined.');
        }));

        it('rpId missmatch', () => client.getAssertion('https://vincss.net', {
            publicKey: {
                rpId: 'https://oauth2.vincss.net',
                challenge: Fido2Crypto.random(32),
            }
        } as any).catch((e: Error) => {
            expect(e instanceof Fido2ClientErrRelyPartyNotAllowed).to.equal(true);
        }));
    });
});