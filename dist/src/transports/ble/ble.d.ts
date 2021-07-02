/// <reference types="node" />
import { Payload, Transport } from "../transport";
import { IFido2Device } from "../../fido2/fido2-device-cli";
import { Observable } from "rxjs";
export interface BleCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class Ble implements Transport {
    private deviceHandle;
    private maxFragmentLength;
    private maxInitFragmentLength;
    private maxContinuationFragmentLength;
    private ready;
    private fidoStatusQueue;
    constructor(uuid: string, maxPacketLength: number);
    static device(): Promise<Observable<IFido2Device>>;
    static release(): Promise<void>;
    private internalSend;
    private internalRecv;
    private getCharacteristic;
    private init;
    send(payload: Payload): Promise<void>;
    recv(): Promise<Payload>;
    close(): Promise<void>;
}
