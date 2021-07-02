/// <reference types="node" />
import { Payload } from "../../transports/transport";
import { ICtap2Cmd } from "../ctap2";
import { Options } from "./get-info";
export declare const Ctap2GetAssertionCmd = 2;
export interface Fido2Assertion {
    credential: PublicKeyCredentialDescriptor;
    authData: Buffer;
    signature: Buffer;
    user?: PublicKeyCredentialUserEntity;
    numberOfCredentials?: number;
    userSelected?: boolean;
    largeBlobKey?: Buffer;
}
export declare class Ctap2GetAssertionReq implements ICtap2Cmd {
    rpId: string;
    clientDataHash: Buffer;
    allowList: PublicKeyCredentialDescriptor[] | undefined;
    extensions: Map<string, any> | undefined;
    options: Options | undefined;
    pinUvAuthParam: Buffer | undefined;
    pinUvAuthProtocol: number | undefined;
    initialize(rpId: string, clientDataHash: Buffer, allowList?: PublicKeyCredentialDescriptor[], extensions?: Map<string, any>, options?: Options, pinUvAuthParam?: Buffer, pinUvAuthProtocol?: number): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class Ctap2GetAssertionRes implements ICtap2Cmd {
    credential: PublicKeyCredentialDescriptor;
    authData: Buffer;
    signature: Buffer;
    user: PublicKeyCredentialUserEntity | undefined;
    numberOfCredentials: number | undefined;
    userSelected: boolean | undefined;
    largeBlobKey: Buffer | undefined;
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
