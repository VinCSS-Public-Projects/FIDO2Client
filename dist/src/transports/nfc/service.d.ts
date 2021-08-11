/// <reference types="node" />
import { Observable } from "rxjs";
import { Device, IFido2Device } from "../../fido2/fido2-device-cli";
import { DeviceService, DeviceState } from "../transport";
export declare type NfcType = 'CCID' | 'UART';
export interface NFC {
    type: NfcType;
    name: string;
    reader: any;
    device: IFido2Device;
}
export interface SmartCard {
    send(data: Buffer): Promise<number>;
    recv(): Promise<Buffer>;
}
export declare class CCID implements SmartCard {
    private reader;
    private responseQueue;
    constructor(reader: any);
    get name(): string;
    send(data: Buffer): Promise<number>;
    recv(timeout?: number): Promise<Buffer>;
}
declare class NfcService implements DeviceService {
    private device;
    private deviceSubject;
    private ccid;
    state: DeviceState;
    constructor();
    /**
     * Turn on nfc service. Find all fido2 card.
     * @returns
     */
    start(): Promise<void>;
    stop(): Promise<void>;
    get observable(): Observable<Device>;
    getCard(name?: string): NFC;
    release(): Promise<void>;
    shutdown(): Promise<void>;
}
export declare const nfc: NfcService;
export {};
