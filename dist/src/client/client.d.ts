import { WrapCredentialCreationOptions } from "../webauthn/WrapCredentialCreateOptions";
import { WrapCredentialRequestOptions } from "../webauthn/WrapCredentialRequestOptions";
import { WrapPublicKeyCredential } from "../webauthn/WrapPublicKeyCredential";
import { IClientOptions } from "./options";
interface IFido2Client {
    makeCredential(origin: string, options: WrapCredentialCreationOptions): Promise<WrapPublicKeyCredential>;
    getAssertion(origin: string, options: WrapCredentialRequestOptions): Promise<WrapPublicKeyCredential>;
    release(): Promise<void>;
}
export interface IClientRequest {
    publisher: string;
    process: string;
    rp: string;
    trusted: boolean;
}
export interface IFido2DeviceInfo {
    uv?: boolean;
    uvRetries?: number;
    clientPin?: boolean;
    pinRetries?: number;
}
export declare class Fido2Client implements IFido2Client {
    private session;
    private options;
    private modal;
    private event;
    private pin;
    private device;
    private request;
    private cancel;
    private subs;
    constructor(options?: IClientOptions);
    private get subscription();
    private emit;
    private makeExtensionsInput;
    private makeExtensionsOutput;
    private internalGetPinUvAuthToken;
    private getPinUvAuthToken;
    private makeClientRequest;
    /**
     *
     * @param origin
     * @param options
     * @returns
     */
    makeCredential(origin: string, options: WrapCredentialCreationOptions): Promise<WrapPublicKeyCredential>;
    /**
     *
     * @param origin
     * @param options
     * @returns
     */
    getAssertion(origin: string, options: WrapCredentialRequestOptions): Promise<WrapPublicKeyCredential>;
    release(): Promise<void>;
}
export {};
