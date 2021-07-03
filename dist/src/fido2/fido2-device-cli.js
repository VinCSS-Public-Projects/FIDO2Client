"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fido2DeviceCli = void 0;
const rxjs_1 = require("rxjs");
const common_1 = require("../errors/common");
const device_cli_1 = require("../errors/device-cli");
const ble_1 = require("../transports/ble/ble");
const nfc_1 = require("../transports/nfc/nfc");
const usb_1 = require("../transports/usb/usb");
const ble_fido2_device_cli_1 = require("./ble-fido2-device-cli");
const hid_fido2_device_cli_1 = require("./hid-fido2-device-cli");
const nfc_fido2_device_cli_1 = require("./nfc-fido2-device-cli");
class Fido2DeviceCli {
    constructor() {
        this.available = false;
    }
    open(device) {
        switch (device.transport) {
            case 'usb': {
                if (device.path === undefined)
                    throw new device_cli_1.DeviceCliCanNotOpen();
                // TODO: fix maxPacketLength
                this.fido2DeviceCli = new hid_fido2_device_cli_1.HidFido2DeviceCli(device.path, 64);
                break;
            }
            case 'ble': {
                if (device.uuid === undefined)
                    throw new device_cli_1.DeviceCliCanNotOpen();
                this.fido2DeviceCli = new ble_fido2_device_cli_1.BleFido2DeviceCli(device.uuid, device.maxPacketLength ? device.maxPacketLength : 20);
                break;
            }
            case 'nfc': {
                this.fido2DeviceCli = new nfc_fido2_device_cli_1.NfcFido2DeviceCli(device.nfcType, device.name);
                break;
            }
            default:
                throw new device_cli_1.DeviceCliTransportUnsupported();
        }
        this.available = true;
    }
    async close() {
        this.fido2DeviceCli && this.fido2DeviceCli.close();
        await Promise.all([ble_1.Ble.release(), usb_1.Usb.release(), nfc_1.Nfc.release()]);
    }
    async release() {
        throw new common_1.MethodNotImplemented();
    }
    async enumerate(transports = ['ble', 'nfc', 'usb']) {
        return new rxjs_1.Observable(subscriber => {
            ble_1.Ble.device().then(x => x.subscribe(subscriber));
            usb_1.Usb.device().then(x => x.subscribe(subscriber));
            nfc_1.Nfc.device().then(x => x.subscribe(subscriber));
        });
    }
    get console() {
        return new Promise(async (resolve, reject) => {
            if (!this.available)
                return reject(new device_cli_1.DeviceCliNotInitialized());
            // TODO: ping timeout, fixed with 15 seconds.
            // let ping = await this.cli.ping() as bigint;
            // if (ping >= 15000000000) { throw new DeviceCliNotResponding() }
            resolve(this.fido2DeviceCli);
        });
    }
}
exports.Fido2DeviceCli = Fido2DeviceCli;
