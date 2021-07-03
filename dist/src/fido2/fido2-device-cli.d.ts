/// <reference types="node" />
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
export interface IFido2DeviceCli {
    msg(): void;
    cbor(payload: Payload, keepAlive?: Subject<number>): Promise<Buffer>;
    init(): void;
    ping(): Promise<bigint | undefined>;
    cancel(): void;
    keepAlive(): void;
    wink(): void;
    lock(): void;
    close(): void;
    setMaxMsgSize(value: number): void;
}
export declare class Fido2DeviceCli {
    private fido2DeviceCli;
    private available;
    constructor();
    open(device: IFido2Device): void;
    close(): Promise<void>;
    release(): Promise<void>;
    enumerate(transports?: ('usb' | 'ble' | 'nfc')[]): Promise<Observable<IFido2Device>>;
    get console(): Promise<IFido2DeviceCli>;
}
