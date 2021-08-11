import { Subject } from "rxjs";
import { Device as Fido2Device } from "../../fido2/fido2-device-cli";
import { DeviceService, DeviceState } from "../transport";
declare class UsbService implements DeviceService {
    state: DeviceState;
    private device;
    private deviceSubject;
    private adapterSubject;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    get observable(): Subject<Fido2Device>;
    release(): Promise<void>;
    shutdown(): Promise<void>;
}
export declare const usb: UsbService;
export {};
