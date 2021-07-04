import { expect } from "chai";
import { FIDO2Client } from "..";
import { Fido2Crypto } from "../src/crypto/crypto";

describe('HMAC secret extension', () => {

    it('pin available on environment', () => {
        expect(process.env.PIN).to.be.an('string');
        expect(process.env.PIN).to.have.lengthOf.above(3);
    });

    describe('request', () => {
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

        let credentialId: ArrayBuffer;

        it('make hmac secret', () => client.makeCredential('https://vincss.net', {
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
                extensions: {
                    hmacCreateSecret: true
                }
            }
        } as any).then(x => {
            credentialId = x.rawId;
            expect(x.id).to.be.an('string');
            expect(x.rawId instanceof ArrayBuffer).to.equal(true);
            expect(x.type).to.equal('public-key');
            expect((x.response as AuthenticatorAttestationResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAttestationResponse).attestationObject instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacCreateSecret).to.equal(true);
        }));

        let salt1 = Fido2Crypto.hash(Buffer.from('salt1'));
        let salt2 = Fido2Crypto.hash(Buffer.from('salt2'));
        let output1: ArrayBuffer[] = [];
        let output2: ArrayBuffer[] = [];

        it('get output1', () => client.getAssertion('https://vincss.net', {
            publicKey: {
                rpId: 'vincss.net',
                challenge: Fido2Crypto.random(32),
                allowCredentials: [
                    {
                        id: credentialId,
                        type: 'public-key'
                    }
                ],
                userVerification: 'required',
                extensions: {
                    hmacGetSecret: {
                        salt1
                    }
                }
            }
        } as any).then(x => {
            output1.push(x.clientExtensionResults.hmacGetSecret.output1);
            expect(x.id).to.be.an('string');
            expect(x.rawId instanceof ArrayBuffer).to.equal(true);
            expect(Buffer.from(x.rawId).compare(Buffer.from(credentialId))).to.equal(0);
            expect(x.type).to.equal('public-key');
            expect((x.response as AuthenticatorAssertionResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).authenticatorData instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).signature instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output1 instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output1.byteLength).to.equal(32);
            expect(x.clientExtensionResults.hmacGetSecret.output2).to.equal(undefined);
        }));

        it('get output1 output2', () => client.getAssertion('https://vincss.net', {
            publicKey: {
                rpId: 'vincss.net',
                challenge: Fido2Crypto.random(32),
                allowCredentials: [
                    {
                        id: credentialId,
                        type: 'public-key'
                    }
                ],
                userVerification: 'required',
                extensions: {
                    hmacGetSecret: {
                        salt1,
                        salt2
                    }
                }
            }
        } as any).then(x => {
            output1.push(x.clientExtensionResults.hmacGetSecret.output1);
            output2.push(x.clientExtensionResults.hmacGetSecret.output2);
            expect(x.id).to.be.an('string');
            expect(x.rawId instanceof ArrayBuffer).to.equal(true);
            expect(Buffer.from(x.rawId).compare(Buffer.from(credentialId))).to.equal(0);
            expect(x.type).to.equal('public-key');
            expect((x.response as AuthenticatorAssertionResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).authenticatorData instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).signature instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output1 instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output1.byteLength).to.equal(32);
            expect(x.clientExtensionResults.hmacGetSecret.output2 instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output2.byteLength).to.equal(32);
        }));

        it('get output1 output2', () => client.getAssertion('https://vincss.net', {
            publicKey: {
                rpId: 'vincss.net',
                challenge: Fido2Crypto.random(32),
                allowCredentials: [
                    {
                        id: credentialId,
                        type: 'public-key'
                    }
                ],
                userVerification: 'required',
                extensions: {
                    hmacGetSecret: {
                        salt1,
                        salt2
                    }
                }
            }
        } as any).then(x => {
            output1.push(x.clientExtensionResults.hmacGetSecret.output1);
            output2.push(x.clientExtensionResults.hmacGetSecret.output2);
            expect(x.id).to.be.an('string');
            expect(x.rawId instanceof ArrayBuffer).to.equal(true);
            expect(Buffer.from(x.rawId).compare(Buffer.from(credentialId))).to.equal(0);
            expect(x.type).to.equal('public-key');
            expect((x.response as AuthenticatorAssertionResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).authenticatorData instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).signature instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output1 instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output1.byteLength).to.equal(32);
            expect(x.clientExtensionResults.hmacGetSecret.output2 instanceof ArrayBuffer).to.equal(true);
            expect(x.clientExtensionResults.hmacGetSecret.output2.byteLength).to.equal(32);
        }));

        it('validate hmac-secret', () => {
            expect(output1.length).to.equal(3);
            expect(output2.length).to.equal(2);
            expect(output1.every(x => Buffer.from(x).compare(Buffer.from(output1[0])) === 0)).to.equal(true);
            expect(output2.every(x => Buffer.from(x).compare(Buffer.from(output2[0])) === 0)).to.equal(true);
        });
    });
});