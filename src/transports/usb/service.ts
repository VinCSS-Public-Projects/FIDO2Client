import { from, interval, Observable, Subject } from "rxjs";
import { IFido2Device } from "../../fido2/fido2-device-cli";
import { Device, devices } from "node-hid";
import { filter, map, takeUntil, tap } from "rxjs/operators";
import { logger } from "../../log/debug";
import { deviceInfo } from "./native/bindings";
import { DeviceService, DeviceState } from "../transport";

const kHidUsage = 1;
const kHidUsagePage = 0xf1d0;

class UsbService implements DeviceService {
    state: DeviceState;
    private device: Map<string, IFido2Device>;
    private deviceSubject: Subject<IFido2Device>;
    private adapterSubject: Subject<void>;

    constructor() {
        this.state = DeviceState.off;
        this.device = new Map<string, IFido2Device>();
        this.deviceSubject = new Subject<IFido2Device>();
        this.adapterSubject = new Subject<void>();
        logger.debug('create usb service success');
    }

    async start(): Promise<void> {
        /**
         * Only start usb service when service is off.
         */
        if (this.state === DeviceState.on) return;

        logger.debug('start usb service');

        /**
         * @TODO fix me. Implement usb detection instead scan device by interval.
         */
        interval(1600).pipe(takeUntil(this.adapterSubject)).subscribe(() => from(devices()).pipe(
            filter(x => x.usage === kHidUsage && x.usagePage === kHidUsagePage),
            filter(x => x.path !== undefined),
            filter(x => this.device.get(x.path as string) === undefined),
            map<Device, IFido2Device>(x => {
                let info = deviceInfo(x.path);
                return {
                    path: x.path,
                    serialNumber: info.serial,
                    manufacturer: info.manufacturer,
                    product: info.product,
                    transport: 'usb'
                }
            })
        ).subscribe(x => {
            this.device.set(x.path as string, x);
            this.deviceSubject.next(x);
        }));

        this.state = DeviceState.on;
        return;
    }

    async stop(): Promise<void> {
        /**
         * Only stop usb service when service is on.
         */
        if (this.state === DeviceState.off) return;

        logger.debug('stop usb service');

        /**
         * Update service state.
         */
        this.state = DeviceState.off;

        this.adapterSubject.next();
        this.device.clear();
    }

    get observable(): Observable<IFido2Device> {
        return this.deviceSubject;
    }

    async release(): Promise<void> {
        this.adapterSubject.next();
        this.device.clear();
        return;
    }

    async shutdown(): Promise<void> {
        this.adapterSubject.next();
        this.device.clear();
        return;
    }
}

export const usb = new UsbService();