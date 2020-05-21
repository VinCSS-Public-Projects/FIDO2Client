# FIDO2 client - Node.js
* FIDO2 is comprised of the W3C's Web Authentication specification (WebAuthn) and FIDO Alliance's corresponding Client-to-Authenticator Protocol (CTAP). FIDO2 supports passwordless, second-factor and multi-factor user experiences with embedded (or bound) authenticators (such as biometric or PIN) or external/roaming authenticators (such as FIDO Security keys, mobile devices, wearables, etc...).

* Currently PIN protocols are only supported on Windows and Chrome on macOS. Therefore, we have created a PIN protocol support library that uses Node.js to communicate directly with the security key.

* With this library we have made it possible for users to use OpenVPN with a security key.


## Summary
To use this library on a BrowserWindow with `nodeIntegration: false` you must
add our [preload.js](preload.js) on global context or execute [proxy.js](proxy.js) on that BrowserWindow's webContains context.

Then, these two below events must be handled from main process:

```javascript
let fido2 = new FIDO2Client();

ipcMain.handle('navigator.credentials.create', (event, publicCreateOptions) => {
    return fido2.makeCredential(publicCreateOptions, event.sender.getURL());
});

ipcMain.handle('navigator.credentials.get', (event, publicGetOptions) => {
    return fido2.getAssertion(publicGetOptions, event.sender.getURL());
});
```

In general, you can simply use those 2 methods as `navigator.credentials.create()`, `navigator.credentials.get()` 
if your application allows `nodeIntegration`.

```javascript
let fido2 = new FIDO2Client();

fido2.makeCredential(publicCreateOptions, origin).then((credential) => {
    // Do stuff.
});

fido2.getAssertion(publicGetOptions, origin).then((assertion) => {
    // Do stuff.
});
```

## Events
Method `FIDO2Client.makeCredential()` and method `FIDO2Client.getAssertion()` will emit those below events.
By default, those events will be handled automatically. In case self-handled (such as GUI custom), the return data must be sent back to FIDO2 client via method `FIDO2Client.reply()` as described below.

#### Event: `fido2-device-not-found` (optional)
Emitted when no FIDO2 device available (busy/not found).

Parameter:
* None

Return:
* None

Example:
```javascript
fido2.on('fido2-device-not-found', () => {
    // Do stuff.
})
```

#### Event: `fido2-set-new-pin` (required)
Emitted when authenticator requires to set new PIN for the first time.

Parameter:
* None

Return:
* `newPin` String - new PIN from user.

Example:
```javascript
fido2.on('fido2-set-new-pin', () => {
    // Do stuff and get new PIN from user.
    fido2.reply(newPin);
})
```

#### Event: `fido2-select-device` (required)
Emitted when more than one FIDO2 devices are available.

Parameter:
* `devices` Array - Array of [HIDDevice](docs/api/HIDDevice.md) for available FIDO2 devices.

Return:
* `index` Number - Index of selected FIDO2 device.

Example:
```javascript
fido2.on('fido2-select-device', (devices) => {
    // Do stuff and get device index from user.
    fido2.reply(index);
})
```

#### Event `fido2-enter-pin` (required)
Emitted when authenticator requires PIN to get pinToken.

Parameter:
* None

Return:
* `pin` String - PIN from user.

Example:
```javascript
fido2.on('fido2-enter-pin', () => {
    // Do stuff and get PIN from user.
    fido2.reply(pin);
})
```

#### Event `fido2-valid-pin` (optional)
Emitted when PIN is valid.

Parameter:
* None

Return:
* None

Example:
```javascript
fido2.on('fido2-valid-pin', () => {
    // Do stuff.
})
```

#### Event `fido2-invalid-pin` (optional)
Emitted when PIN is invalid.

Parameter:
* `retries` Number - Total remaining PIN retries.

Return:
* None

Example:
```javascript
fido2.on('fido2-invalid-pin', (retries) => {
    // Do stuff.
})
```

#### Event `fido2-make-credential-success` (optional)
Emitted when `makeCredential` process is success (include resident key mode).

Parameter:
* None

Return:
* None

Example:
```javascript
fido2.on('fido2-no-credentials', () => {
    // Do stuff.
})
```

#### Event `fido2-no-credentials` (optional)
Emitted when no credential was found on the authenticator with current relying party.

Parameter:
* None

Return:
* None

Example:
```javascript
fido2.on('fido2-no-credentials', () => {
    // Do stuff.
})
```

#### Emitted `fido2-resident-key` (required)
Emitted when more than one credential was found on authenticator (in residentKey mode) with current relying party.
Return an array of `Assertion`.

Parameter:
* `credentialInfo` Array - Array of `Assertion`. 

Return:
* `index` Number - Index of selected assertion.  

Example:
```javascript
fido2.on('fido2-resident-key', (credentialInfo) => {
    // Do stuff and get selected assertion index from user.
    fido2.reply(index);
})
```

#### Event `fido2-pin-auth-blocked` (optional)
Emitted when PIN auth is blocked (current device's boot session).

Parameter:
* None

Return:
* None

Example:
```javascript
fido2.on('fido2-pin-auth-blocked', () => {
    // Do stuff.
})
```

#### Event `fido2-pin-locked` (optional)
Emitted when PIN is blocked (full blocked, need to reset device).

Parameter:
* None

Return:
* None

Example:
```javascript
fido2.on('fido2-pin-blocked', () => {
    // Do stuff.
})
```

#### Event `fido2-ctap2-error` (optional)
Emitted on other CTAP2 error.

Parameter:
* `code` Number - CTAP2 error code.

Return:
* None

Example:
```javascript
fido2.on('fido2-ctap2-error', (code) => {
    // Do stuff.
})
```

