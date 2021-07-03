import { Subject } from 'rxjs';
import { IClientObservable } from '../client/client';
export declare class DefaultModal extends Subject<IClientObservable> {
    private browser;
    private ready;
    constructor();
    private get window();
}
