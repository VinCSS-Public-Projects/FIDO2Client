/// <reference types="node" />
import { Observable } from "rxjs";
import { IFido2Device } from "../fido2/fido2-device-cli";
export interface Payload {
    cmd: number;
    data: Buffer;
}
export interface Transport {
    send(payload: Payload): Promise<void>;
    recv(): Promise<Payload>;
    close(): void;
}
export interface Packet {
    initialize(...args: any[]): this;
    serialize(): Buffer;
    deserialize(payload: Buffer): this;
}
export interface DeviceService {
    state: DeviceState;
    start(): Promise<void>;
    stop(): Promise<void>;
    get observable(): Observable<IFido2Device>;
    release(): Promise<void>;
}
export declare enum DeviceState {
    on = 0,
    off = 1
}
