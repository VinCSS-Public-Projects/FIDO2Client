import { Observable } from "rxjs";
import { Device } from "../fido2/fido2-device-cli";

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
    get observable(): Observable<Device>;
    release(): Promise<void>;
    shutdown(): Promise<void>;
}

export enum DeviceState {
    on,
    off
}