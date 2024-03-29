import bindings from 'bindings';
import { interval, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const PCSC = bindings('pcsc.node');

export const NativeCardServiceUpdateInterval = 250;

interface Service {

    /**
     * Update native services.
     */
    update(): void;

    /**
     * Add native services listener.
     * @param name 
     * @param listener 
     */
    on(name: 'card' | 'error' | 'update', listener: (arg: any) => void): void;
}

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

export class NativeCard {

    /**
     * Native card interface.
     */
    private card: NativeCardInterface

    constructor(metadata: NativeCardMetadata) {
        this.card = new PCSC.card();
        this.card.open(metadata);
    }

    /**
     * Transmit data and get response from card.
     * @param data
     * @returns
     */
    transmit(data: Buffer): Buffer {
        return this.card.transmit(data);
    }

    /**
     * Close native card interface.
     */
    close(): void {
        this.card.close();
    }
}

class NativeCardServiceController {

    private serviceSubject: Subject<NativeCardMetadata>;

    /**
     * Status subject for turning on/off service.
     */
    private statusSubject: Subject<void>;

    /**
     * Update subject.
     */
    private updateSubject: Subject<number>;

    /**
     * Native card service handler.
     */
    private service: Service;

    constructor() {

        /**
         * Init service.
         */
        this.statusSubject = new Subject<void>();
        this.updateSubject = new Subject<number>();
        this.service = new PCSC.service();

        this.serviceSubject = new Subject<NativeCardMetadata>();

        /**
         * Add service listeners.
         */
        this.service.on('card', (card: NativeCardMetadata) => this.serviceSubject.next(card));
        this.service.on('error', (e: Error) => this.serviceSubject.error(e));
        this.service.on('update', (delta: number) => this.updateSubject.next(delta));
    }

    /**
     * Emit consumed time (in ms) of last update.
     */
    get update(): Observable<number> {
        return this.updateSubject.asObservable();
    }

    /**
     * Start native card service.
     */
    start(): void {
        interval(NativeCardServiceUpdateInterval).pipe(takeUntil(this.statusSubject)).subscribe(() => {
            try {
                this.service.update();
            } catch (e) {
                this.serviceSubject.error(e);
            }
        });
    }

    /**
     * Stop native card service.
     */
    stop(): void {
        this.statusSubject.next();
    }

    get observable() {
        return this.serviceSubject.asObservable();
    }
}

export const pcsc = new NativeCardServiceController();