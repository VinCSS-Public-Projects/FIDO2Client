import bindings from 'bindings';

const usb = bindings('usb.node');

interface IHidDevice {
    manufacturer?: string;
    product?: string;
    serial?: string;
}

export function deviceInfo(devicePath?: string): IHidDevice {
    return usb.device(devicePath);
}