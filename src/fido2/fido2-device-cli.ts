import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MethodNotImplemented } from '../errors/common';
import { DeviceCliCanNotOpen, DeviceCliNotInitialized, DeviceCliTransportUnsupported } from '../errors/device-cli';
import { Ble } from '../transports/ble/ble';
import { Nfc } from '../transports/nfc/nfc';
import { NfcType } from '../transports/nfc/service';
import { Payload } from '../transports/transport';
import { Usb } from '../transports/usb/usb';
import { BleFido2DeviceCli } from './ble-fido2-device-cli';
import { HidFido2DeviceCli } from './hid-fido2-device-cli';
import { NfcFido2DeviceCli } from './nfc-fido2-device-cli';

export interface IFido2Device {
    path?: string;
    uuid?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    product?: string;
    batteryLevel?: number;
    address?: string;
    firmwareVersion?: string;
    appearance?: number;
    name?: string;
    maxPacketLength?: number;
    nfcType?: NfcType;
    transport: 'usb' | 'ble' | 'nfc'
}
export interface IFido2DeviceCli {
    msg(): void;
    cbor(payload: Payload, keepAlive?: Subject<number>): Promise<Buffer>;
    init(): void;
    ping(): Promise<bigint | undefined>;
    cancel(): void;
    keepAlive(): void;
    wink(): void;
    lock(): void;
    close(): void;
    setMaxMsgSize(value: number): void;
}

export class Fido2DeviceCli {
    private fido2DeviceCli!: HidFido2DeviceCli | BleFido2DeviceCli | NfcFido2DeviceCli;
    private available: boolean;

    constructor() {
        this.available = false;
    }

    open(device: IFido2Device): void {
        switch (device.transport) {
            case 'usb': {
                if (device.path === undefined) throw new DeviceCliCanNotOpen();
                // TODO: fix maxPacketLength
                this.fido2DeviceCli = new HidFido2DeviceCli(device.path, 64);
                break;
            }
            case 'ble': {
                if (device.uuid === undefined) throw new DeviceCliCanNotOpen();
                this.fido2DeviceCli = new BleFido2DeviceCli(device.uuid as string, device.maxPacketLength ? device.maxPacketLength : 20);
                break;
            }
            case 'nfc': {
                this.fido2DeviceCli = new NfcFido2DeviceCli(device.nfcType, device.name);
                break;
            }
            default:
                throw new DeviceCliTransportUnsupported();
        }
        this.available = true;
    }

    async close(): Promise<void> {
        this.fido2DeviceCli && this.fido2DeviceCli.close();
        this.available = false;
        await Promise.all([Ble.release(), Usb.release(), Nfc.release()]);
    }

    async release(): Promise<void> {
        throw new MethodNotImplemented();
    }

    async enumerate(transports: ('usb' | 'ble' | 'nfc')[] = ['ble', 'nfc', 'usb']): Promise<Observable<IFido2Device>> {
        return new Observable<IFido2Device>(subscriber => {
            Ble.device().then(x => x.subscribe(subscriber));
            Usb.device().then(x => x.subscribe(subscriber));
            Nfc.device().then(x => x.subscribe(subscriber));
        }).pipe(filter(x => transports.includes(x.transport)));
    }

    get console(): Promise<IFido2DeviceCli> {
        return new Promise<IFido2DeviceCli>(async (resolve, reject) => {
            if (!this.available) return reject(new DeviceCliNotInitialized());
            // TODO: ping timeout, fixed with 15 seconds.
            // let ping = await this.cli.ping() as bigint;
            // if (ping >= 15000000000) { throw new DeviceCliNotResponding() }
            resolve(this.fido2DeviceCli);
        });
    }
}