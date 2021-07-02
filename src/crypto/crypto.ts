import { createHash, createHmac, createECDH, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Fido2Spec, Fido2SpecVersion } from '../../environment';
import { CommonFido2SpecNotImplemented } from '../errors/common';

export interface IFido2CryptoKey {
    publicKey: Buffer;
    privateKey: Buffer;
}

export class Fido2Crypto {
    static hash(message: Buffer): Buffer {
        switch (Fido2Spec) {
            case Fido2SpecVersion.v21:
                return createHash('sha256').update(message).digest();
            default:
                throw new CommonFido2SpecNotImplemented();
        }

    }
    static hmac(key: Buffer, message: Buffer): Buffer {
        switch (Fido2Spec) {
            case Fido2SpecVersion.v21:
                return createHmac('sha256', key).update(message).digest();
            default:
                throw new CommonFido2SpecNotImplemented();
        }
    }
    static encrypt(key: Buffer, message: Buffer): Buffer {
        switch (Fido2Spec) {
            case Fido2SpecVersion.v21: {
                let cipher = createCipheriv('aes-256-cbc', key, Buffer.alloc(16));
                return cipher.update(message);
            }
            default:
                throw new CommonFido2SpecNotImplemented();
        }
    }
    static decrypt(key: Buffer, cipher: Buffer): Buffer {
        switch (Fido2Spec) {
            case Fido2SpecVersion.v21: {
                let decipher = createDecipheriv('aes-256-cbc', key, Buffer.alloc(16));
                decipher.setAutoPadding(false);
                return decipher.update(cipher);
            }
            default:
                throw new CommonFido2SpecNotImplemented();
        }
    }
    static regenerate(): IFido2CryptoKey {
        switch (Fido2Spec) {
            case Fido2SpecVersion.v21: {
                let key = createECDH('prime256v1');
                key.generateKeys();
                return { publicKey: key.getPublicKey(), privateKey: key.getPrivateKey() }
            }
            default:
                throw new CommonFido2SpecNotImplemented();
        }

    }
    static sharedSecretGeneration(privateKey: Buffer, publicKey: Buffer): Buffer {
        switch (Fido2Spec) {
            case Fido2SpecVersion.v21: {
                let key = createECDH('prime256v1');
                key.setPrivateKey(privateKey);
                return Fido2Crypto.hash(key.computeSecret(publicKey));
            }
            default:
                throw new CommonFido2SpecNotImplemented();
        }
    }

    static random(length: number): Buffer {
        return randomBytes(length);
    }
}