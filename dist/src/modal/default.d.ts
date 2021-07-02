/// <reference types="node" />
import EventEmitter from 'events';
export declare class DefaultModal extends EventEmitter {
    private browser;
    private ready;
    private internalEvent;
    constructor();
    private get window();
}
