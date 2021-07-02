/// <reference types="node" />
export interface IFido2CryptoKey {
    publicKey: Buffer;
    privateKey: Buffer;
}
export declare class Fido2Crypto {
    static hash(message: Buffer): Buffer;
    static hmac(key: Buffer, message: Buffer): Buffer;
    static encrypt(key: Buffer, message: Buffer): Buffer;
    static decrypt(key: Buffer, cipher: Buffer): Buffer;
    static regenerate(): IFido2CryptoKey;
    static sharedSecretGeneration(privateKey: Buffer, publicKey: Buffer): Buffer;
    static random(length: number): Buffer;
}
