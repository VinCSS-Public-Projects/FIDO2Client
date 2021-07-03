import { FIDO2Client } from "../index";
import { expect } from 'chai';
import { Fido2Crypto } from "../src/crypto/crypto";

describe('Credential', () => {

    it('pin available on environment', () => {
        expect(process.env.PIN).to.have.lengthOf.above(4);
    });

    // const client = new FIDO2Client({
    //     defaultModal: false,
    //     event: {
    //         onRequest: async (req) => {
    //             return true;
    //         },
    //         onDeviceAttached: async (device) => {
    //             return device;
    //         },
    //         onEnterPin: async () => {
    //             return process.env.PIN;
    //         }
    //     }
    // });

    // describe('make options', () => {
    //     client.makeCredential('https://vincss.net', {
    //         publicKey: {
    //             rp: {
    //                 name: 'VinCSS',
    //                 id: 'vincss.net'
    //             },
    //             challenge: Fido2Crypto.random(32),
    //             user: {
    //                 name: 'test',
    //                 displayName: 'Test',
    //                 id: Fido2Crypto.random(32),
    //                 icon: 'icon'
    //             },
    //             pubKeyCredParams: [
    //                 {
    //                     alg: -7,
    //                     type: 'public-key'
    //                 }, {
    //                     type: "public-key",
    //                     alg: -257
    //                 }
    //             ],
    //             authenticatorSelection: {
    //                 userVerification: "required"
    //             }
    //         }
    //     });
    // });

    // describe('get', () => {

    // })
});