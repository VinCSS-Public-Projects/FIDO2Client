/// <reference types="node" />
import { Payload, Transport } from "../transport";
import { IFido2Device } from "../../fido2/fido2-device-cli";
import { Observable } from "rxjs";
export declare enum CtapHidCmd {
    Msg = 3,
    Cbor = 16,
    Init = 6,
    Ping = 1,
    Cancel = 17,
    Error = 63,
    KeepAlive = 59,
    Wink = 8,
    Lock = 4
}
export declare enum CtapHidCapBit {
    Wink = 1,
    Cbor = 4,
    Nmsg = 8
}
export interface IUsbCmd {
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class Usb implements Transport {
    private deviceHandle;
    private cid;
    ctapVersion: number;
    deviceMajor: number;
    deviceMinor: number;
    deviceBuild: number;
    deviceCapabilities: number;
    private maxPacketLength;
    private initPacketLength;
    private continuationPacketLength;
    private status;
    constructor(devciePath: string, maxPacketLength: number);
    static device(): Promise<Observable<IFido2Device>>;
    static release(): Promise<void>;
    private internalSend;
    private init;
    send(payload: Payload): Promise<void>;
    recv(): Promise<Payload>;
    close(): void;
}
