import { Observable } from "rxjs";
import { IFido2Device } from "../../fido2/fido2-device-cli";
import { DeviceService, DeviceState } from "../transport";
declare class UsbService implements DeviceService {
    state: DeviceState;
    private device;
    private deviceSubject;
    private adapterSubject;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    get observable(): Observable<IFido2Device>;
    release(): Promise<void>;
}
export declare const usb: UsbService;
export {};
