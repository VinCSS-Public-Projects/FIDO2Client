import { expect } from "chai";
import { FIDO2Client } from "..";
import { Fido2Crypto } from "../src/crypto/crypto";

describe('Credential', () => {

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

        it('make', () => client.makeCredential('https://vincss.net', {
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
            credentialId = x.rawId;
            expect(x.id).to.be.an('string');
            expect(x.rawId instanceof ArrayBuffer).to.equal(true);
            expect(x.type).to.equal('public-key');
            expect((x.response as AuthenticatorAttestationResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAttestationResponse).attestationObject instanceof ArrayBuffer).to.equal(true);
        }));

        it('get', () => client.getAssertion('https://vincss.net', {
            publicKey: {
                rpId: 'vincss.net',
                challenge: Fido2Crypto.random(32),
                allowCredentials: [
                    {
                        id: credentialId,
                        type: 'public-key'
                    }
                ],
                userVerification: 'required'
            }
        } as any).then(x => {
            expect(x.id).to.be.an('string');
            expect(x.rawId instanceof ArrayBuffer).to.equal(true);
            expect(Buffer.from(x.rawId).compare(Buffer.from(credentialId))).to.equal(0);
            expect(x.type).to.equal('public-key');
            expect((x.response as AuthenticatorAssertionResponse).clientDataJSON instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).authenticatorData instanceof ArrayBuffer).to.equal(true);
            expect((x.response as AuthenticatorAssertionResponse).signature instanceof ArrayBuffer).to.equal(true);
        }));
    });
});