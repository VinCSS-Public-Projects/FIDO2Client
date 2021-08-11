/// <reference types="node" />
import { Device } from "../../fido2/fido2-device-cli";
import { Payload, Transport } from "../transport";
import { Observable } from "rxjs";
import { NfcType } from "./service";
export interface NfcCmd {
    initialize(...args: any[]): this;
    serialize(): Payload;
    deserialize(payload: Buffer): this;
}
export declare class Nfc implements Transport {
    private deviceHandle;
    /**
     * @TODO find a way to determine fragment size. Currently using the minimum value.
     */
    private maxFragmentLength;
    constructor(type?: NfcType, name?: string);
    static device(): Promise<Observable<Device>>;
    static release(): Promise<void>;
    send(payload: Payload): Promise<void>;
    recv(): Promise<Payload>;
    close(): void;
}
