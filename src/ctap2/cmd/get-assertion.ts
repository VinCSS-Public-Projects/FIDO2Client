import { decodeFirstSync, encode } from "cbor";
import { Ctap2ErrInvalidCbor } from "../../errors/ctap2";
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
import { Options } from "./get-info";

export const Ctap2GetAssertionCmd = 0x2;

enum Ctap2GetAssertionReqName {
    rpId = 0x1,
    clientDataHash = 0x2,
    allowList = 0x3,
    extensions = 0x4,
    options = 0x5,
    pinUvAuthParam = 0x6,
    pinUvAuthProtocol = 0x7
}

enum Ctap2GetAssertionResName {
    credential = 0x1,
    authData = 0x2,
    signature = 0x3,
    user = 0x4,
    numberOfCredentials = 0x5,
    userSelected = 0x6,
    largeBlobKey = 0x7
}

export interface Fido2Assertion {
    credential: PublicKeyCredentialDescriptor;
    authData: Buffer;
    signature: Buffer;
    user?: PublicKeyCredentialUserEntity;
    numberOfCredentials?: number;
    userSelected?: boolean;
    largeBlobKey?: Buffer;
}

export class Ctap2GetAssertionReq implements ICtap2Cmd {
    rpId!: string;
    clientDataHash!: Buffer;
    allowList: PublicKeyCredentialDescriptor[] | undefined;
    extensions: Map<string, any> | undefined;
    options: Options | undefined;
    pinUvAuthParam!: Buffer | undefined;
    pinUvAuthProtocol!: number | undefined;

    initialize(rpId: string, clientDataHash: Buffer, allowList?: PublicKeyCredentialDescriptor[], extensions?: Map<string, any>, options?: Options, pinUvAuthParam?: Buffer, pinUvAuthProtocol?: number): this {
        this.rpId = rpId;
        this.clientDataHash = clientDataHash;
        this.allowList = allowList;
        this.extensions = extensions;
        this.options = options;
        this.pinUvAuthParam = pinUvAuthParam;
        this.pinUvAuthProtocol = pinUvAuthProtocol;
        return this;
    }
    serialize(): Payload {
        let map = new Map<number, number | Buffer | string | PublicKeyCredentialDescriptor[] | Map<string, any> | Options>();
        map.set(Ctap2GetAssertionReqName.rpId, this.rpId);
        map.set(Ctap2GetAssertionReqName.clientDataHash, this.clientDataHash);
        if (this.allowList) map.set(Ctap2GetAssertionReqName.allowList, this.allowList);
        if (this.extensions) map.set(Ctap2GetAssertionReqName.extensions, this.extensions);
        if (this.options) map.set(Ctap2GetAssertionReqName.options, this.options);
        if (this.pinUvAuthParam) map.set(Ctap2GetAssertionReqName.pinUvAuthParam, this.pinUvAuthParam);
        if (this.pinUvAuthProtocol) map.set(Ctap2GetAssertionReqName.pinUvAuthProtocol, this.pinUvAuthProtocol);
        return { cmd: Ctap2GetAssertionCmd, data: encode(map) }
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class Ctap2GetAssertionRes implements ICtap2Cmd {
    credential!: PublicKeyCredentialDescriptor;
    authData!: Buffer;
    signature!: Buffer;
    user: PublicKeyCredentialUserEntity | undefined;
    numberOfCredentials: number | undefined;
    userSelected: boolean | undefined;
    largeBlobKey: Buffer | undefined;

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        let map: Map<number, Buffer | boolean | number | PublicKeyCredentialDescriptor | PublicKeyCredentialUserEntity>;
        try {
            map = decodeFirstSync(payload);
        } catch (e) {
            throw new Ctap2ErrInvalidCbor();
        }
        this.credential = map.get(Ctap2GetAssertionResName.credential) as PublicKeyCredentialDescriptor;
        this.authData = map.get(Ctap2GetAssertionResName.authData) as Buffer;
        this.signature = map.get(Ctap2GetAssertionResName.signature) as Buffer;
        this.user = map.get(Ctap2GetAssertionResName.user) as PublicKeyCredentialUserEntity;
        this.numberOfCredentials = map.get(Ctap2GetAssertionResName.numberOfCredentials) as number;
        this.userSelected = map.get(Ctap2GetAssertionResName.userSelected) as boolean;
        this.largeBlobKey = map.get(Ctap2GetAssertionResName.largeBlobKey) as Buffer;
        return this;

    }
}