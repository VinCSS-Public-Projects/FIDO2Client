import { IFido2Device } from "../fido2/fido2-device-cli";
import { IClientRequest, IFido2DeviceInfo } from "./client";
export interface IClientEvent {
    onRequest?: (request: IClientRequest) => Promise<boolean>;
    onDeviceAttached?: (device: IFido2Device) => Promise<IFido2Device | void>;
    onDeviceDetached?: (device: IFido2Device) => void;
    onDeviceSelected?: (info: IFido2DeviceInfo) => void;
    onSetPin?: () => Promise<string>;
    onEnterPin?: () => Promise<string>;
    onPinInvalid?: (retries: number) => Promise<string>;
    onPinValid?: () => void;
    onPinAuthBlocked?: () => void;
    onPinBlocked?: () => void;
    onSuccess?: () => void;
    onKeepAlive?: (status: number) => void;
    onTimeout?: () => void;
    onKeepAliveCancel?: () => void;
    onError?: (error: Error) => void;
}
export interface IClientOptions {
    defaultModal?: boolean;
    pinUvAuthProtocol?: number;
    transports?: ('usb' | 'ble' | 'nfc')[];
    event?: IClientEvent;
}
