/// <reference types="node" />
import { Observable } from 'rxjs';
export declare const NativeCardServiceUpdateInterval = 250;
export interface NativeCardMetadata {
    /**
     * Name of reader.
     */
    name: string;
    /**
     * Card atr.
     */
    atr: Buffer;
}
export interface NativeCardInterface {
    open(metadata: NativeCardMetadata): void;
    transmit(data: Buffer): Buffer;
    close(): void;
}
export declare class NativeCard {
    /**
     * Native card interface.
     */
    private card;
    constructor(metadata: NativeCardMetadata);
    /**
     * Transmit data and get response from card.
     * @param data
     * @returns
     */
    transmit(data: Buffer): Buffer;
    /**
     * Close native card interface.
     */
    close(): void;
}
declare class NativeCardServiceController {
    private serviceSubject;
    /**
     * Status subject for turning on/off service.
     */
    private statusSubject;
    /**
     * Update subject.
     */
    private updateSubject;
    /**
     * Native card service handler.
     */
    private service;
    constructor();
    /**
     * Emit consumed time (in ms) of last update.
     */
    get update(): Observable<number>;
    /**
     * Start native card service.
     */
    start(): void;
    /**
     * Stop native card service.
     */
    stop(): void;
    get observable(): Observable<NativeCardMetadata>;
}
export declare const pcsc: NativeCardServiceController;
export {};
