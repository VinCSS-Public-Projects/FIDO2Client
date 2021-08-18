import bindings from 'bindings';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const pcsc = bindings('pcsc.node');

interface Servie {
    update(): void;
    on(name: 'card' | 'error', listener: (arg: any) => void): void;
}

interface NativeCardMetadata {
    name: string;
    atr: Buffer;
}

interface NativeCardInterface {
    open(metadata: NativeCardMetadata): void;
    transmit(data: Buffer): Buffer;
    close(): void;
}

export class NativeCard {
    private card: NativeCardInterface

    constructor(metadata: NativeCardMetadata) {
        this.card = new pcsc.card();
        this.card.open(metadata);
    }

    transmit(data: Buffer): Buffer {
        return this.card.transmit(data);
    }

    close(): void {
        this.card.close();
    }
}

class NativeCardServiceController extends Subject<NativeCardMetadata> {
    private statusSubject: Subject<void>;
    private service: Servie;

    constructor() {
        super();
        this.statusSubject = new Subject<void>();
        this.service = new pcsc.service();
        this.service.on('card', (card: NativeCardMetadata) => {
            this.next(card);
        });
        this.service.on('error', (e: Error) => {
            this.error(e);
        });
    }

    start(): void {
        interval(250).pipe(takeUntil(this.statusSubject)).subscribe(x => {
            this.service.update();
        });
    }

    stop(): void {
        this.statusSubject.next();
    }
}

export const NativeCardService = new NativeCardServiceController();