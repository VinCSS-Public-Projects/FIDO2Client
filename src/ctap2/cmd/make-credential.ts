import { decodeFirstSync, encode } from "cbor";
import { Ctap2ErrInvalidCbor } from "../../errors/ctap2";
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
import { Options } from "./get-info";

export const Ctap2MakeCredentialCmd = 0x1;

enum Ctap2MakeCredentialReqName {
    clientDataHash = 0x1,
    rp = 0x2,
    user = 0x3,
    pubKeyCredParams = 0x4,
    excludeList = 0x5,
    extensions = 0x6,
    options = 0x7,
    pinUvAuthParam = 0x8,
    pinUvAuthProtocol = 0x9,
    enterpriseAttestation = 0xa
}

enum Ctap2MakeCredentialResName {
    fmt = 0x1,
    authData = 0x2,
    attStmt = 0x3,
    epAtt = 0x4,
    largeBlobKey = 0x5
}

export type AttestationStatementFormat = 'packed' | 'tpm' | 'android-key' | 'android-safetynet' | 'fido-u2f' | 'none' | 'apple';

export interface Fido2Credential {
    fmt: AttestationStatementFormat;
    authData: Buffer;
    // TODO: define type for attStmt
    attStmt: any;
    epAtt?: boolean;
    largeBlobKey?: Buffer;
}

export class Ctap2MakeCredentialReq implements ICtap2Cmd {
    clientDataHash!: Buffer;
    rp!: PublicKeyCredentialRpEntity;
    user!: PublicKeyCredentialUserEntity;
    pubKeyCredParams!: PublicKeyCredentialParameters[];
    excludeList!: PublicKeyCredentialDescriptor[] | undefined;
    extensions!: Map<string, any> | undefined;
    options!: Options | undefined;
    pinUvAuthParam!: Buffer | undefined;
    pinUvAuthProtocol!: number | undefined;
    enterpriseAttestation!: number | undefined;

    initialize(clientDataHash: Buffer, rp: PublicKeyCredentialRpEntity, user: PublicKeyCredentialUserEntity, pubKeyCredParams: PublicKeyCredentialParameters[], excludeList?: PublicKeyCredentialDescriptor[], extensions?: Map<string, any>, options?: Options, pinUvAuthParam?: Buffer, pinUvAuthProtocol?: number, enterpriseAttestation?: number): this {
        this.clientDataHash = clientDataHash;
        this.rp = rp;
        this.user = user;
        this.pubKeyCredParams = pubKeyCredParams;
        this.excludeList = excludeList;
        this.extensions = extensions;
        this.options = options;
        this.pinUvAuthParam = pinUvAuthParam;
        this.pinUvAuthProtocol = pinUvAuthProtocol;
        this.enterpriseAttestation = enterpriseAttestation;
        return this;
    }
    serialize(): Payload {
        let map = new Map<number, Buffer | number | string | Options | PublicKeyCredentialRpEntity | PublicKeyCredentialUserEntity | PublicKeyCredentialParameters[] | PublicKeyCredentialDescriptor[] | Map<string, any> | Map<string, boolean>>();
        map.set(Ctap2MakeCredentialReqName.clientDataHash, this.clientDataHash);
        map.set(Ctap2MakeCredentialReqName.rp, this.rp);
        map.set(Ctap2MakeCredentialReqName.user, this.user);
        map.set(Ctap2MakeCredentialReqName.pubKeyCredParams, this.pubKeyCredParams);
        if (this.excludeList && this.excludeList.length) map.set(Ctap2MakeCredentialReqName.excludeList, this.excludeList);
        if (this.extensions) map.set(Ctap2MakeCredentialReqName.extensions, this.extensions);
        if (this.options) map.set(Ctap2MakeCredentialReqName.options, this.options);
        if (this.pinUvAuthParam) map.set(Ctap2MakeCredentialReqName.pinUvAuthParam, this.pinUvAuthParam);
        if (this.pinUvAuthProtocol) map.set(Ctap2MakeCredentialReqName.pinUvAuthProtocol, this.pinUvAuthProtocol);
        if (this.enterpriseAttestation) map.set(Ctap2MakeCredentialReqName.enterpriseAttestation, this.enterpriseAttestation);
        return { cmd: Ctap2MakeCredentialCmd, data: encode(map) }
    }
    deserialize(payload: Buffer): this {
        throw new Error("Method not implemented.");
    }
}
export class Ctap2MakeCredentialRes implements ICtap2Cmd {
    fmt!: AttestationStatementFormat;
    authData !: Buffer;
    // TODO: define type for attStmt
    attStmt!: any;
    epAtt!: boolean;
    largeBlobKey!: Buffer;

    initialize(...args: any[]): this {
        throw new Error("Method not implemented.");
    }
    serialize(): Payload {
        throw new Error("Method not implemented.");
    }
    deserialize(payload: Buffer): this {
        let map: Map<number, Buffer | AttestationStatementFormat | boolean>;
        try {
            map = decodeFirstSync(payload);
        } catch (e) {
            throw new Ctap2ErrInvalidCbor();
        }
        this.fmt = map.get(Ctap2MakeCredentialResName.fmt) as AttestationStatementFormat;
        this.authData = map.get(Ctap2MakeCredentialResName.authData) as Buffer;
        this.attStmt = map.get(Ctap2MakeCredentialResName.attStmt);
        this.epAtt = map.get(Ctap2MakeCredentialResName.epAtt) as boolean;
        this.largeBlobKey = map.get(Ctap2MakeCredentialResName.largeBlobKey) as Buffer;
        return this;
    }
}