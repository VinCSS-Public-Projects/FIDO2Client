import { createECDH, ECDH } from "crypto";
import { ClientPinVersion } from "../../environment";
import { Fido2Crypto } from "../crypto/crypto";

export interface ICOSEKey {
    kty: number;
    alg: number;
    crv: number;
    x: Buffer;
    y: Buffer
    serialize(): Map<number, number | Buffer>;
    deserialize(payload: Map<number, number | Buffer>): this;
}

enum COSEKeyName {
    kty = 1,
    alg = 3,
    crv = -1,
    x = -2,
    y = -3
}

export class COSEKey implements ICOSEKey {
    kty!: number;
    alg!: number;
    crv!: number;
    x!: Buffer;
    y!: Buffer;

    initialize(key: Buffer): this {
        /**
         * @TODO fix me
         */
        this.kty = 2;
        this.alg = -25;
        this.crv = 1;
        this.x = Buffer.alloc(32);
        this.y = Buffer.alloc(32);
        key.copy(this.x, 0, 1, 33);
        key.copy(this.y, 0, 33, 66);
        return this;
    }

    serialize(): Map<number, number | Buffer> {
        let map = new Map<number, number | Buffer>();
        map.set(COSEKeyName.kty, this.kty);
        map.set(COSEKeyName.alg, this.alg);
        map.set(COSEKeyName.crv, this.crv);
        map.set(COSEKeyName.x, this.x);
        map.set(COSEKeyName.y, this.y);
        return map;
    }
    deserialize(payload: Map<number, number | Buffer>): this {
        this.kty = payload.get(COSEKeyName.kty) as number;
        this.alg = payload.get(COSEKeyName.alg) as number;
        this.crv = payload.get(COSEKeyName.crv) as number;
        this.x = payload.get(COSEKeyName.x) as Buffer;
        this.y = payload.get(COSEKeyName.y) as Buffer;
        return this;
    }
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
    encapsulate(peerCoseKey: COSEKey): { platformKeyAgreement: COSEKey, sharedSecret: Buffer };
    decapsulate(peerCoseKey: COSEKey): Buffer;
    encrypt(key: Buffer, plaintext: Buffer): Buffer;
    decrypt(key: Buffer, ciphertext: Buffer): Buffer;
    authenticate(key: Buffer, message: Buffer): Buffer;
    version: ClientPinVersion;
}

export class ClientPinV1 implements IPinUvAuthProtocol {
    private key!: ECDH;
    private platformKeyAgreement!: COSEKey;
    version: ClientPinVersion;

    constructor() {
        this.initialize();
        this.version = ClientPinVersion.v1;
    }


    private ecdh(peerCoseKey: COSEKey): Buffer {
        return this.kdf(this.key.computeSecret(Buffer.concat([Buffer.alloc(1, 0x4), peerCoseKey.x, peerCoseKey.y])));
    }
    private kdf(z: Buffer): Buffer {
        return Fido2Crypto.hash(z);
    }

    initialize(): void {
        this.key = createECDH('prime256v1');
        this.key.generateKeys();
    }
    encapsulate(peerCoseKey: COSEKey): { platformKeyAgreement: COSEKey, sharedSecret: Buffer } {
        this.key.generateKeys();
        return {
            platformKeyAgreement: new COSEKey().initialize(this.key.getPublicKey()),
            sharedSecret: this.ecdh(peerCoseKey)
        }
    }
    decapsulate(peerCoseKey: COSEKey): Buffer {
        return this.ecdh(peerCoseKey);
    }
    encrypt(key: Buffer, plaintext: Buffer): Buffer {
        return Fido2Crypto.encrypt(key, plaintext);
    }
    decrypt(key: Buffer, ciphertext: Buffer): Buffer {
        return Fido2Crypto.decrypt(key, ciphertext);
    }
    authenticate(key: Buffer, message: Buffer): Buffer {
        return Fido2Crypto.hmac(key, message).slice(0, 16);
    }
}