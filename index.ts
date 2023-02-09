/**
 * Bootstrap, resolve modules alias.
 */
import path from 'path';
// import { addAlias } from 'module-alias';

// addAlias('@components', path.join(__dirname, 'src'));
// addAlias('@third_party', path.join(__dirname, 'third_party'));

/**
 * FIDO2 client modules.
 */
import { Fido2Client, IFido2DeviceInfo } from './src/client/client';
import { IClientEvent, IClientOptions } from './src/client/options';
import { Fido2DeviceCli, IFido2Device } from './src/fido2/fido2-device-cli';
import { Fido2Crypto } from './src/crypto/crypto';
import { verify } from './third_party/sign/index';

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

export {
    verify as verifySignature
}

export const PreloadPath = path.join(__dirname, 'preload.js');