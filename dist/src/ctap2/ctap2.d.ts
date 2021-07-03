/// <reference types="node" />
import { Fido2DeviceCli } from "../fido2/fido2-device-cli";
import { Payload } from "../transports/transport";
import { IClientPinCli, IPinUvAuthProtocol } from "./client-pin";
import { Fido2Assertion } from "./cmd/get-assertion";
import { Options } from "./cmd/get-info";
import { Fido2Credential } from "./cmd/make-credential";
import { IInfo } from "./get-info";
import { Subject } from "rxjs";
export declare enum Ctap2Cmd {
    MakeCredential = 1,
    GetAssertion = 2,
    GetNextAssertion = 8,
    GetInfo = 4,
    ClientPIN = 6,
    Reset = 7,
    BioEnrollment = 9,
    Selection = 11,
    LargeBlobs = 12,
    Config = 13
}
export interface ICtap2Cmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
interface MakeCredentialOptions {
    clientDataHash: Buffer;
    rp: PublicKeyCredentialRpEntity;
    user: PublicKeyCredentialUserEntity;
    pubKeyCredParams: PublicKeyCredentialParameters[];
    excludeList?: PublicKeyCredentialDescriptor[];
    extensions?: Map<string, any>;
    options?: Options;
    pinUvAuthParam?: Buffer;
    pinUvAuthProtocol?: number;
    enterpriseAttestation?: number;
}
interface GetCredentialOptions {
    rpId: string;
    clientDataHash: Buffer;
    allowList?: PublicKeyCredentialDescriptor[];
    extensions?: Map<string, any>;
    options?: Options;
    pinUvAuthParam?: Buffer;
    pinUvAuthProtocol?: number;
}
interface ICtap2Cli {
    makeCredential(option: MakeCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Credential>;
    getAssertion(option: GetCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Assertion[]>;
    getNextAssertion(keepAlive?: Subject<number>): Promise<Fido2Assertion>;
    info: Promise<IInfo>;
    clientPin: IClientPinCli;
    reset(): void;
    bioEnrollment(): void;
    credentialManagement(): void;
    selection(): void;
    largeBlobs(): void;
    config(): void;
}
export declare class Ctap2Cli implements ICtap2Cli {
    private devcie;
    private _clientPin;
    constructor(devcie: Fido2DeviceCli, _clientPin: IPinUvAuthProtocol);
    makeCredential(option: MakeCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Credential>;
    getAssertion(option: GetCredentialOptions, keepAlive?: Subject<number>): Promise<Fido2Assertion[]>;
    getNextAssertion(keepAlive?: Subject<number>): Promise<Fido2Assertion>;
    get info(): Promise<IInfo>;
    get clientPin(): IClientPinCli;
    reset(): void;
    bioEnrollment(): void;
    credentialManagement(): void;
    selection(): void;
    largeBlobs(): void;
    config(): void;
}
export {};
