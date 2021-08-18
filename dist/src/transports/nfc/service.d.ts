/// <reference types="node" />
import { Observable } from "rxjs";
import { Device, IFido2Device } from "../../fido2/fido2-device-cli";
import { DeviceService, DeviceState } from "../transport";
export declare type NfcType = 'CCID' | 'UART';
export interface NFC {
    type: NfcType;
    name: string;
    atr: Buffer;
    device: IFido2Device;
}
export interface SmartCard {
    send(data: Buffer): Promise<number>;
    recv(): Promise<Buffer>;
}
export declare class CCID implements SmartCard {
    /**
     * Native card controller.
     */
    private card;
    /**
     * Response queue.
     */
    private responseQueue;
    constructor(name: string, atr: Buffer);
    send(data: Buffer): Promise<number>;
    recv(timeout?: number): Promise<Buffer>;
}
declare class NfcService implements DeviceService {
    /**
     * Map that store FIDO2 card attach on reader.
     */
    private device;
    /**
     * Subject of FIDO2 card.
     */
    private deviceSubject;
    /**
     * Service state.
     */
    state: DeviceState;
    constructor();
    /**
     * Turn on nfc service. Find all FIDO2 cards.
     * @returns
     */
    start(): Promise<void>;
    /**
     * Stop nfc service. Remove all FIDO2 cards.
     * @returns
     */
    stop(): Promise<void>;
    get observable(): Observable<Device>;
    getCard(name?: string): NFC;
    release(): Promise<void>;
    shutdown(): Promise<void>;
}
export declare const nfc: NfcService;
export {};
