import { Subject } from "rxjs";
import { Device, IFido2Device } from "../../fido2/fido2-device-cli";
import noble from '@abandonware/noble';
import { DeviceService, DeviceState } from "../transport";
export interface BLE {
    peripheral: noble.Peripheral;
    characteristics: noble.Characteristic[];
    device: IFido2Device;
}
export declare const FidoService = "fffd";
export declare enum FidoCharacteristic {
    fidoControlPoint = "f1d0fff1deaaeceeb42fc9ba7ed623bb",
    fidoStatus = "f1d0fff2deaaeceeb42fc9ba7ed623bb",
    fidoControlPointLength = "f1d0fff3deaaeceeb42fc9ba7ed623bb",
    fidoServiceRevisionBitfield = "f1d0fff4deaaeceeb42fc9ba7ed623bb",
    fidoServiceRevision = "2a28",
    batteryLevel = "2a19",
    appearance = "2a01",
    deviceName = "2a00",
    firmwareVersion = "2a26",
    manufacturer = "2a29"
}
declare class BleService implements DeviceService {
    state: DeviceState;
    private device;
    private deviceSubject;
    private adapterSubject;
    constructor();
    /**
     * Start ble service, allow service to scan device.
     * @returns
     */
    start(): Promise<void>;
    /**
     * Stop ble service, stop service scanning device.
     * @returns
     */
    stop(): Promise<void>;
    /**
     * Get ble service observable, notify when fido2 ble device is nearby.
     */
    get observable(): Subject<Device>;
    /**
     * Get connected device.
     */
    getDevice(uuid: string): BLE;
    /**
     * Release ble service, disconnect all peripheral.
     */
    release(): Promise<void>;
    /**
     * Remove all listener, free resource, ...
     */
    shutdown(): Promise<void>;
}
export declare const ble: BleService;
export {};
