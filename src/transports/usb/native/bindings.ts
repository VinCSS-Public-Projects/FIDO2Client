import bindings from 'bindings';

const binding = bindings('usb.node');

interface IHidDevice {
    manufacturer?: string;
    product?: string;
    serial?: string;
}

export function deviceInfo(devicePath?: string): IHidDevice {
    return binding.device(devicePath);
}