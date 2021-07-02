/// <reference types="node" />
import EventEmitter from "events";
import { IFido2DeviceInfo } from "../client/client";
import { IFido2Device } from "../fido2/fido2-device-cli";
export declare type AllowChannel = string;
export interface Modal extends EventEmitter {
}
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
    getRequest: Promise<ModalRequest>;
    deviceAttach(listener: (device: IFido2Device) => void): void;
    selectDevice(device: any): Promise<IFido2DeviceInfo>;
    cancelTransaction(): void;
    keepAlive(listener: (status: number) => void): void;
    transactionSuccess: Promise<void>;
    enterPin(pin: string): void;
    pinValid: Promise<void>;
    pinInvalid(listener: (retries: number) => void): void;
    pinAuthBlocked: Promise<void>;
    pinBlocked: Promise<void>;
    message: Promise<ModalMessage>;
}
