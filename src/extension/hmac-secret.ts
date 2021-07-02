import { IClientPinCli } from "../ctap2/client-pin";
import { Fido2ClientErrInvalidParameter } from "../errors/client";
import { IExtension } from "./extension";

export const HmacSecretExtIdentifier = 'hmac-secret';

export interface HMACGetSecretInput {
    salt1: Buffer;
    salt2?: Buffer;
};

enum HmacSecretExtName {
    keyAgreement = 0x1,
    saltEnc = 0x2,
    saltAuth = 0x3,
    pinUvAuthProtocol = 0x4
}

export class HmacSecretInput implements IExtension<boolean | Map<number, any>> {
    private hmacCreateSecret!: boolean;
    private hmacGetSecret!: { salt1: Buffer, salt2?: Buffer };

    constructor(private clientPin: IClientPinCli) { }

    make(hmacCreateSecret: boolean): this {
        this.hmacCreateSecret = hmacCreateSecret;
        return this;
    }
    get(salt1: Buffer, salt2?: Buffer): this {
        if (salt1.length !== 32) throw new Fido2ClientErrInvalidParameter('extensions.hmacGetSecret.salt1');
        if (salt2 && salt2.length !== 32) throw new Fido2ClientErrInvalidParameter('extensions.hmacGetSecret.salt2');
        this.hmacGetSecret = { salt1: salt1, salt2: salt2 }
        return this;
    }
    async build(): Promise<boolean | Map<number, any>> {
        if (this.hmacCreateSecret !== undefined && typeof this.hmacCreateSecret === 'boolean') {
            return this.hmacCreateSecret as boolean;
        }
        if (this.hmacCreateSecret !== undefined) throw new Fido2ClientErrInvalidParameter('extensions.hmacCreateSecret');

        if (this.hmacGetSecret !== undefined) {
            let map = new Map<number, number | Buffer | Map<number, number | Buffer>>();
            let capsulate = this.clientPin.console.encapsulate(await this.clientPin.getKeyAgreement());
            let saltEnc = this.clientPin.console.encrypt(capsulate.sharedSecret, Buffer.concat([this.hmacGetSecret.salt1, this.hmacGetSecret.salt2 || Buffer.alloc(0)]));
            map.set(HmacSecretExtName.keyAgreement, capsulate.platformKeyAgreement.serialize());
            map.set(HmacSecretExtName.saltEnc, saltEnc);
            map.set(HmacSecretExtName.saltAuth, this.clientPin.console.authenticate(capsulate.sharedSecret, saltEnc));
            map.set(HmacSecretExtName.pinUvAuthProtocol, this.clientPin.version);
            return map;
        }
        throw new Fido2ClientErrInvalidParameter('extensions.hmacGetSecret');
    }
}

export class HmacSecretOutput implements IExtension<boolean | { output1: ArrayBuffer, output2?: ArrayBuffer }> {
    private hmacCreateSecret!: boolean;
    private hmacGetSecret!: Buffer;

    constructor(private clientPin: IClientPinCli) { }

    make(hmacCreateSecret: boolean): this {
        this.hmacCreateSecret = hmacCreateSecret;
        return this;
    }
    get(output: Buffer): this {
        this.hmacGetSecret = output;
        return this;
    }
    async build(): Promise<boolean | { output1: ArrayBuffer; output2?: ArrayBuffer; }> {
        if (this.hmacCreateSecret !== undefined && typeof this.hmacCreateSecret === 'boolean') {
            return this.hmacCreateSecret as boolean;
        }
        if (this.hmacCreateSecret !== undefined) throw new Fido2ClientErrInvalidParameter('extensions.hmacCreateSecret');

        if (this.hmacGetSecret !== undefined) {
            let sharedSecret = this.clientPin.console.decapsulate(await this.clientPin.getKeyAgreement());
            let output = this.clientPin.console.decrypt(sharedSecret, this.hmacGetSecret);
            let output1 = output.buffer.slice(output.byteOffset, output.byteOffset + 32);
            let result: { output1: ArrayBuffer; output2?: ArrayBuffer } = { output1 };
            if (output.length === 64) {
                let output2 = output.buffer.slice(output.byteOffset + 32, output.byteOffset + 64);
                result.output2 = output2;
            }
            return result;
        }
        throw new Fido2ClientErrInvalidParameter('extensions.hmacGetSecret')
    }
}