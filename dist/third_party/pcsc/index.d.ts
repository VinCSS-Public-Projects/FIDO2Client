/// <reference types="node" />
import { Subject } from 'rxjs';
export interface NativeCardMetadata {
    name: string;
    atr: Buffer;
}
export interface NativeCardInterface {
    open(metadata: NativeCardMetadata): void;
    transmit(data: Buffer): Buffer;
    close(): void;
}
export declare class NativeCard {
    private card;
    constructor(metadata: NativeCardMetadata);
    transmit(data: Buffer): Buffer;
    close(): void;
}
declare class NativeCardServiceController extends Subject<NativeCardMetadata> {
    private statusSubject;
    private service;
    constructor();
    start(): void;
    stop(): void;
}
export declare const NativeCardService: NativeCardServiceController;
export {};
