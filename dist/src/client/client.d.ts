import { IFido2Device } from "../fido2/fido2-device-cli";
import { WrapCredentialCreationOptions } from "../webauthn/WrapCredentialCreateOptions";
import { WrapCredentialRequestOptions } from "../webauthn/WrapCredentialRequestOptions";
import { WrapPublicKeyCredential } from "../webauthn/WrapPublicKeyCredential";
import { IClientOptions } from "./options";
import { Fido2Event } from "./event";
interface IFido2Client {
    makeCredential(origin: string, options: WrapCredentialCreationOptions, sameOriginWithAncestors: boolean): Promise<WrapPublicKeyCredential>;
    getAssertion(origin: string, options: WrapCredentialRequestOptions, sameOriginWithAncestors: boolean): Promise<WrapPublicKeyCredential>;
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
export interface IClientObservable {
    type: Fido2Event;
    data?: IClientRequest | IFido2DeviceInfo | IFido2Device | number | boolean | string | void;
}
export declare class Fido2Client implements IFido2Client {
    private session;
    private options;
    private modal;
    private pin;
    private device;
    private request;
    private keepAlive;
    private cancel;
    private error;
    private clientSubject;
    private subs;
    constructor(options?: IClientOptions);
    private get subscription();
    private makeExtensionsInput;
    private makeExtensionsOutput;
    private internalGetPinUvAuthToken;
    private getPinUvAuthToken;
    private makeClientRequest;
    private onCancel;
    private onError;
    /**
     *
     * @param origin
     * @param options
     * @returns
     */
    makeCredential(origin: string, options: WrapCredentialCreationOptions, sameOriginWithAncestors?: boolean): Promise<WrapPublicKeyCredential>;
    /**
     *
     * @param origin
     * @param options
     * @returns
     */
    getAssertion(origin: string, options: WrapCredentialRequestOptions, sameOriginWithAncestors?: boolean): Promise<WrapPublicKeyCredential>;
    release(): Promise<void>;
}
export {};
