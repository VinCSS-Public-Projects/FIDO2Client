/// <reference types="node" />
import { Info } from '../ctap2/get-info';
import { Observable, Subject } from 'rxjs';
import { NfcType } from '../transports/nfc/service';
import { Payload } from '../transports/transport';
export interface IFido2Device {
    path?: string;
    uuid?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    product?: string;
    batteryLevel?: number;
    address?: string;
    firmwareVersion?: string;
    appearance?: number;
    name?: string;
    maxPacketLength?: number;
    nfcType?: NfcType;
    transport: 'usb' | 'ble' | 'nfc';
}
export interface Device {
    device: IFido2Device;
    status: 'attach' | 'detach';
}
export interface IFido2DeviceCli {
    msg(): void;
    cbor(payload: Payload, keepAlive?: Subject<number>): Promise<Buffer>;
    init(): void;
    ping(): Promise<bigint | undefined>;
    cancel(): Promise<void>;
    keepAlive(): void;
    wink(): void;
    lock(): void;
    close(): void;
    setMaxMsgSize(value: number): void;
    get haveTransaction(): boolean;
}
export declare class Fido2DeviceCli {
    private fido2DeviceCli;
    private available;
    info: Info;
    constructor();
    open(device: IFido2Device): Promise<void>;
    close(): Promise<void>;
    release(): Promise<void>;
    enumerate(transports?: ('usb' | 'ble' | 'nfc')[]): Promise<Observable<Device>>;
    get console(): Promise<IFido2DeviceCli>;
}
