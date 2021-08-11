/// <reference types="node" />
import { ClientPinVersion } from "../../environment";
export interface ICOSEKey {
    kty: number;
    alg: number;
    crv: number;
    x: Buffer;
    y: Buffer;
    serialize(): Map<number, number | Buffer>;
    deserialize(payload: Map<number, number | Buffer>): this;
}
export declare class COSEKey implements ICOSEKey {
    kty: number;
    alg: number;
    crv: number;
    x: Buffer;
    y: Buffer;
    initialize(key: Buffer): this;
    serialize(): Map<number, number | Buffer>;
    deserialize(payload: Map<number, number | Buffer>): this;
}
export interface IClientPinCli {
    getPinRetries(): Promise<number>;
    getKeyAgreement(): Promise<COSEKey>;
    setPin(pin: string): Promise<void>;
    changePin(pin: string, newPin: string): Promise<void>;
    /**
     * @superseded
     */
    getPinToken(pinUnicode: string): Promise<Buffer>;
    getPinUvAuthTokenUsingUvWithPermissions(): Promise<void>;
    getUVRetries(): Promise<number>;
    getPinUvAuthTokenUsingPinWithPermissions(): Promise<void>;
    version: ClientPinVersion;
    console: IPinUvAuthProtocol;
}
export interface IPinUvAuthProtocol {
    initialize(): void;
    encapsulate(peerCoseKey: COSEKey): {
        platformKeyAgreement: COSEKey;
        sharedSecret: Buffer;
    };
    decapsulate(peerCoseKey: COSEKey): Buffer;
    encrypt(key: Buffer, plaintext: Buffer): Buffer;
    decrypt(key: Buffer, ciphertext: Buffer): Buffer;
    authenticate(key: Buffer, message: Buffer): Buffer;
    version: ClientPinVersion;
}
export declare class ClientPinV1 implements IPinUvAuthProtocol {
    private key;
    private platformKeyAgreement;
    version: ClientPinVersion;
    constructor();
    private ecdh;
    private kdf;
    initialize(): void;
    encapsulate(peerCoseKey: COSEKey): {
        platformKeyAgreement: COSEKey;
        sharedSecret: Buffer;
    };
    decapsulate(peerCoseKey: COSEKey): Buffer;
    encrypt(key: Buffer, plaintext: Buffer): Buffer;
    decrypt(key: Buffer, ciphertext: Buffer): Buffer;
    authenticate(key: Buffer, message: Buffer): Buffer;
}
