/// <reference types="node" />
interface IFlags {
    up: boolean;
    rfu1: boolean;
    uv: boolean;
    rfu2: number;
    at: boolean;
    ed: boolean;
}
interface IAttestedCredentialData {
    aaguid: Buffer;
    credentialIdLength: number;
    credentialId: Buffer;
    credentialPublicKey: Map<number, any>;
}
export declare class AuthenticatorData {
    rpIdHash: Buffer;
    flags: IFlags;
    signCount: number;
    attestedCredentialData: IAttestedCredentialData | undefined;
    extensions: any;
    constructor(buff: Buffer);
}
export {};
