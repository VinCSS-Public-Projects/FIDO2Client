/// <reference types="node" />
import { IClientPinCli } from "../ctap2/client-pin";
import { IExtension } from "./extension";
export declare const HmacSecretExtIdentifier = "hmac-secret";
export interface HMACGetSecretInput {
    salt1: Buffer;
    salt2?: Buffer;
}
export declare class HmacSecretInput implements IExtension<boolean | Map<number, any>> {
    private clientPin;
    private hmacCreateSecret;
    private hmacGetSecret;
    constructor(clientPin: IClientPinCli);
    make(hmacCreateSecret: boolean): this;
    get(salt1: Buffer, salt2?: Buffer): this;
    build(): Promise<boolean | Map<number, any>>;
}
export declare class HmacSecretOutput implements IExtension<boolean | {
    output1: ArrayBuffer;
    output2?: ArrayBuffer;
}> {
    private clientPin;
    private hmacCreateSecret;
    private hmacGetSecret;
    constructor(clientPin: IClientPinCli);
    make(hmacCreateSecret: boolean): this;
    get(output: Buffer): this;
    build(): Promise<boolean | {
        output1: ArrayBuffer;
        output2?: ArrayBuffer;
    }>;
}
