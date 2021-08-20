interface IHidDevice {
    manufacturer?: string;
    product?: string;
    serial?: string;
}
export declare function deviceInfo(devicePath?: string): IHidDevice;
export {};
