# FIDO2Client
>  Create a new FIDO2 client.

```javascript
const { FIDO2Client } = require('@vincss-public-projects/fido2-client');

const client = new FIDO2Client();
```

## Class: FIDO2Client
> Create a new FIDO2 client with native properties as set by `options`.

### `new FIDO2Client([options])` ###

> Create a new FIDO2 client with native properties as set by `options`.

* `options`: `Object` (optional)

  * `defaultModal`: `boolean` (optional) -  The default modal for the client. The modal will handle all events. The default value is `true`.

  * `pinUvAuthProtocol`: `number` (optional) - PIN/UV auth protocols. The default value is `1`.

  * `transports`: `Array<string>` (optional) - A list of transports for client. The default value are all transports `['usb', 'ble', 'nfc']`.
    Possible transports are:

      * `usb` - USB Human Interface Device transport.
      * `ble` - Bluetooth Low Energy transport.
      * `nfc` - Near Field Communication transport.

  * `event`: `IClientEvent` (optional) - Client event handler. By default, all events will be handled automatically by the default modal.

    * `onRequest`: `(request: `[IClientRequest](client-request.md)`) => Promise<boolean>`

      > Emit when the client receives the request, resolve to `true` in case accepting this request. Otherwise, the request will be canceled.

    * `onDeviceAttached`: `(device: `[IFido2Device](fido2-device.md)`) => Promise<IFido2Device>`

      > Emit when a FIDO2 device is attached. This action allows user to see the device, if the user select this device then this action return to resolve itself. Otherwise, the device will be ignored.

    * `onDeviceDetached`: `(device: `[IFido2Device](fido2-device.md)`) => void`

      > Emit when a FIDO2 device is detached. Useful for updating the list of FIDO2 devices.

    * `onDeviceSelected`: `(info: `[IFido2DeviceInfo](fido2-device-info.md)`) => void`

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
    
    * `onKeepAliveCancel`: `() => void`

      > Emit when pending keep alive was cancelled by device.

    * `onTimeout`: `() => void`

      > Emit when the client request is timeout.

    * `onError`: `(e: Error) => void`

      > Emir when other errors occurred.

### Instance Methods

#### `makeCredential(origin, options[, sameOriginWithAncestors])`

> Return a Promise the resolve with a new  [PublicKeyCredential](https://www.w3.org/TR/webauthn-3/#iface-pkcredential) instance based on the provided options.

* `origin`: `string` - The origin of request.

* `options`: `Object`

  * `publicKey`: [PublicKeyCredentialCreationOptions](https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialcreationoptions) -  The options for credential creation.

* `sameOriginWithAncestors`: `boolean` - Possible value are:
  * `true` - The caller of request is same-origin.
  * `false` - The caller of request is cross-origin.

#### `getAssertion(origin, options[, sameOriginWithAncestors])`

> Return a Promise the resolve with a new  [PublicKeyCredential](https://www.w3.org/TR/webauthn-3/#iface-pkcredential) instance based on the provided options.

* `origin`: `string` - The origin of request.

* `options`: `Object`

  * `publicKey`: [PublicKeyCredentialRequestOptions](https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialrequestoptions) -  The options for assertion generation.

* `sameOriginWithAncestors`: `boolean` - Possible value are:
  * `true` - The caller of request is same-origin.
  * `false` - The caller of request is cross-origin.

#### `release()`: `Promise<void>`

> Release FIDO2 client.
