import { Fido2Client, IFido2DeviceInfo } from './src/client/client';
import { IClientEvent, IClientOptions } from './src/client/options';
import { Fido2DeviceCli, IFido2Device } from './src/fido2/fido2-device-cli';
import { Fido2Crypto } from './src/crypto/crypto';
import path from 'path';

export * from './src/errors/client';
export {
    Fido2Client as FIDO2Client,
    IClientOptions,
    IFido2DeviceInfo,
    IFido2Device,
    IClientEvent,
    Fido2DeviceCli,
    Fido2Crypto as FIDO2Crypto
}

export const PreloadPath = path.join(__dirname, 'preload.js');