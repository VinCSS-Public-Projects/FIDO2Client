/// <reference types="node" />
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
import { Options } from "./get-info";
export declare const Ctap2MakeCredentialCmd = 1;
export declare type AttestationStatementFormat = 'packed' | 'tpm' | 'android-key' | 'android-safetynet' | 'fido-u2f' | 'none' | 'apple';
export interface Fido2Credential {
    fmt: AttestationStatementFormat;
    authData: Buffer;
    attStmt: any;
    epAtt?: boolean;
    largeBlobKey?: Buffer;
}
export declare class Ctap2MakeCredentialReq implements ICtap2Cmd {
    clientDataHash: Buffer;
    rp: PublicKeyCredentialRpEntity;
    user: PublicKeyCredentialUserEntity;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    excludeList: PublicKeyCredentialDescriptor[] | undefined;
    extensions: Map<string, any> | undefined;
    options: Options | undefined;
    pinUvAuthParam: Buffer | undefined;
    pinUvAuthProtocol: number | undefined;
    enterpriseAttestation: number | undefined;
    initialize(clientDataHash: Buffer, rp: PublicKeyCredentialRpEntity, user: PublicKeyCredentialUserEntity, pubKeyCredParams: PublicKeyCredentialParameters[], excludeList?: PublicKeyCredentialDescriptor[], extensions?: Map<string, any>, options?: Options, pinUvAuthParam?: Buffer, pinUvAuthProtocol?: number, enterpriseAttestation?: number): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class Ctap2MakeCredentialRes implements ICtap2Cmd {
    fmt: AttestationStatementFormat;
    authData: Buffer;
    attStmt: any;
    epAtt: boolean;
    largeBlobKey: Buffer;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
