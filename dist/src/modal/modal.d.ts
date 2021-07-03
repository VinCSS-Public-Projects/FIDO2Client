import { IClientRequest, IFido2DeviceInfo } from "../client/client";
import { IFido2Device } from "../fido2/fido2-device-cli";
export interface IModal {
    onRequest(request: IClientRequest): Promise<boolean>;
    onDeviceAttached(device: IFido2Device): Promise<IFido2Device>;
    onDeviceSelected(info: IFido2DeviceInfo): void;
    onSetPin(): Promise<string>;
    onEnterPin(): Promise<string>;
    onPinInvalid(retries: number): Promise<string>;
    onPinValid(): void;
    onPinAuthBlocked(): void;
    onPinBlocked(): void;
    onSuccess(): void;
    onKeepAlive(status: number): void;
    onTimeout(): void;
    onError(error: Error): void;
}
export declare type AllowChannel = string;
export interface ModalRequest {
    publisher: string;
    process: string;
    rp: string;
    trusted: boolean;
}
export interface ModalMessage {
    type: string;
    data: any;
}
export interface ModalRequest {
    publisher: string;
    process: string;
    rp: string;
    trusted: boolean;
}
export interface IpcRendererApi {
    close(): void;
    acceptRequest(): void;
    rejectRequest(): void;
    get getRequest(): Promise<ModalRequest>;
    deviceAttach(listener: (device: any) => void): void;
    selectDevice(device: any): Promise<IFido2DeviceInfo>;
    cancelTransaction(): void;
    keepAlive(listener: (status: number) => void): void;
    get transactionSuccess(): Promise<void>;
    enterPin(pin: string): void;
    get pinValid(): Promise<void>;
    pinInvalid(listener: (retries: number) => void): void;
    get pinAuthBlocked(): Promise<void>;
    get pinBlocked(): Promise<void>;
    get noCredentials(): Promise<void>;
    get message(): Promise<ModalMessage>;
}
