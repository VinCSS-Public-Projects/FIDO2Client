# FIDO2 CLIENT - NODE.JS

- FIDO2 is comprised of the W3C's Web Authentication specification (WebAuthn) and FIDO Alliance's corresponding Client-to-Authenticator Protocol (CTAP). FIDO2 supports passwordless, second-factor, and multi-factor user experiences with embedded (or bound) authenticators (such as biometric or PIN) or external/roaming authenticators (such as FIDO Security keys, mobile devices, wearables, etc...).
- Currently, PIN protocols are only supported on Windows and Chrome on macOS. Therefore, we have created a PIN protocol support library that uses Node.js to communicate directly with the security key.
- With this library, we have made it possible for users to use OpenVPN with a security key.

## Summary ##

The FIDO2 client library lets you access FIDO2 devices over BLE, USB, and NFC transports.

## Implementation ##

- USB transport
- BLE transport
- NFC transport
- Client PIN
- Default modal

## Installation

### npm ###

```sh
npm install @vincss-public-projects/fido2-client
```

### Supported Platforms ###

- Mac OS X
- Windows
- Linux

### Windows ###

On Windows v1903 and newer versions, direct access to CTAP1/CTAP2 requires admin privilege over all transports, include this library.

For rebuild

* Windows 10 SDK 10.0.17763.0
* 


### Mac OS X ###

For Bluetooth Low Energy (BLE) transport, you must allow Bluetooth Privacy.

### Debian/Ubuntu ###

For USB Human Interface Device (USB HID) transport, you will need to install development packages for libudev.

```sh
sudo apt-get install libudev-dev libusb-1.0-0-dev libfox-1.6-dev
```

For Near Field Communication (NFC) transport, you would need to install pcsclite library and daemon.

```sh
sudo apt install libpcsclite1 libpcsclite-dev
sudo apt install pcscd
```

# Usage #

## FIDO2Client ##

> Create FIDO2 client.

```javascript
const { FIDO2Client } = require('@vincss-public-projects/fido2-client');

const client = new FIDO2Client();
```

### `new FIDO2Client([options])` ###

> Create a new FIDO2 client with native properties as set by `options`.

* options: Object (optional)

  * `defaultModal`: `boolean` (optional) -  The default modal for the client. The modal will handle all events. The default value is `true`.

  * `pinUvAuthProtocol`: `number` (optional) - PIN/UV auth protocols. The default value is `1`.

  * `transports`: `Array<string>` (optional) - A list of transports for client. The default value are all transports `['usb', 'ble', 'nfc']`.
    Possible transports are:

      * `usb` - USB Human Interface Device transport.
      * `ble` - Bluetooth Low Energy transport.
      * `nfc` - Near Field Communication transport.

  * `event`: `IClientEvent` (optional) - Client event handler. By default, all events will be handled automatically by the default modal.

    * `onRequest`: `(request: IClientRequest) => Promise<boolean>`

      > Emit when the client receives the request, resolve to `true` in case accepting this request. Otherwise, the request will be canceled.

    * `onDeviceAttached`: `(device: IFido2Device) => Promise<IFido2Device>`

      > Emit when a FIDO2 device is attached. This action allows user to see the device, if the user select this device then this action return to resolve itself. Otherwise, the device will be ignored.

    * `onDeviceSelected`: `(info: IFido2DeviceInfo) => void`

      > Emit when sucessfully opens the selected device, allow client to get info from the device.

    * `onSetPin`: `() => Promise<string>`

      > Emit when the client needs to set a PIN for the device. Try to get PIN from the user and resolve PIN.

    * `onEnterPin`: `() => Promise<string>`

      > Emit when the client needs PIN to get `pinUvAuthToken`. Try to get PIN from user and resolve PIN.

    * `onPinInvalid`: `(retries: number) => Promise<string>`

      > Emit immediately after get `pinUvAuthToken` failed with `CTAP2_ERR_PIN_INVALID`. Try to get PIN from the user and resolve PIN. Be careful: need to avoid looping, which can lead to client PIN blocked.

    * `onPinValid`: `() => void`

      > Emit when successfully get `pinUvAuthToken`.

    * `onPinAuthBlocked`: `() => void`

      > Emit when PIN authentication using `pinUvAuthToken` is blocked. Requires power cycle to reset (such as remove and reinsert device) to continue.

    * `onPinBlocked`: `() => void`

      > Emit when the device is blocked. Device is completely locked, inaccessible, only factory reset is possible.

    * `onSuccess`: `() => void`

      > Emit when the client requests successfully. In most cases the device return to `CTAP2_OK`.

    * `onKeepAlive`: `(status: number) => void`

      > Emit when the device is processing. Only available on `usb` and `ble` transport. Possible `status` value are:

      - `1` - The authenticator is still processing the current request.
      - `2` - The authenticator is waiting for user presence.

    * `onTimeout`: `() => void`

      > Emit when the client request is timeout.

    * `onError`: `(e: Error) => void`

      > Emir when other errors occurred.

### `IClientRequest` ###

> Contain information about the source of the request to the client. Let the user decide to accept or deny the request.

* `process`: `string` The process name that running the client.
* `publisher`: `string` The publisher of process that running the client. Only available on Windows and OS X.
* `trusted`: `boolean` Set to `true` if the `publisher` is trusted.
* `rp`: `string` Relying party that sends the request to the client.

### `IFido2Device` ###

> Contain details about a FIDO2 device. Possible properties are:

* `transport`: `string` The transport, possible value are `usb`, `ble` and `nfc`.
* `path`: `string` The path of the device, only available on `usb` transport.
* `uuid`: `string` The uuid of the device, only available on `ble` transport.
* `name`: `string` The name of NFC reader that FIDO2 applet  
  present, only available on `nfc` transport.
* `manufacturer`: `string` The manufacturer of the device, only available on `ble` and `usb` transports.
* `serialNumber`: `string` The serial of the device, only available on `usb` transport.
* `product`: `string` The product name of the device, only available on `usb` transport.
* `batteryLevel`: `string` The current battery level of the device, only available on `ble` transport.

### `IFido2DeviceInfo` ###

> Contain info of the selected device.

* `uv`: `boolean | undefined` - This indicates that the authenticator supports a built-in user verification method. For example, devices with LCD, biometrics, ... Possible value are:
  * `undefined` - Indicates that the authenticator does not have a built-in user verification method.
  * `true` - Indicates that the authenticator does not have a built-in user verification method and that user verification method is presently configured, ready for user verification.
  * `false` - Indicates that the authenticator does not have a built-in user verification method and that user verification method is not presently configured, need to be configured before user verification.
* `clientPin`: `boolean | undefined` - Indicates the authenticator accept client PIN request from the client. Possible value are
  * `undefined` - Indicates that the device not capable of client PIN request from the client.
  * `true` - Indicates that the device capable of client PIN request from the client and PIN has been set.
  * `false` - Indicates that the device capable of client PIN request from the client but PIN has not been set yet.
* `uvRetries`: `number` - Number of built-in user verification method attempts remaining before blocked.
* `pinRetries`: `number` - Number of PIN attempts remaining before blocked.



## Electron compatible ##

To use this library on a `BrowserWindow` you must execute [preload.js](preload.js) on that BrowserWindow's webContains context.

`preload.js` will override two javascript APIs `navigator.credentials.create` and `navigator.credentials.get` to force the web page to use our client instead of the OS client. So it needs `preload.js` to be run in the same context of the web page, leading to require `contextIsolation` is set to `false` in `webPreferences` options of the `BrowserWindow`.

Then, these two below events must be handled from main process:

```javascript
let fido2 = new FIDO2Client();

ipcMain.handle('navigator.credentials.create', (event, options) => {
    return fido2.makeCredential(event.sender.getURL(), options);
});

ipcMain.handle('navigator.credentials.get', (event, options) => {
    return fido2.getAssertion(event.sender.getURL(), options);
});
```

## End of support v1.x.x