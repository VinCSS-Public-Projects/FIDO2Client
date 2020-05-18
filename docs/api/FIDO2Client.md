# FIDO2Client
> Create and control FIDO2 device.

Process: Main
```javascript
// In the main process
let { BrowserWindow } = require('electron');
const {FIDO2Client, PreloadPath} = require('fido2client');
// Create BrowserWindow and call preload.js
let win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
        nodeIntegration: false,
        enableRemoteModule: false,
        preload: PreloadPath,
    }
});

// Load page.
win.loadURL(url).then(() => {
    console.log('Done');
});

// Create FIDO2 object.
let fido2 = new FIDO2Client();
console.log(fido2);
```
## Methods
The `FIDO2Client` class has the following method:

### `constructor(useDefaultModal)`
* `useDefaultModal` boolean

Create and control FIDO2 device, if `useDefaultModal` is `true` all event will be handle by default, otherwise you must handle those event 
yourself. Parameter `useDefaultModal` default value is `true`.

If you set `useDefaultModal` to `false` and don't handle all require event, an `FIDO2ClientMissingEventListener` error 
will be throw.

### `FIDO2Client.testUserPresence(option)`
* `option` [AuthenticatorSelectionCriteria](https://www.w3.org/TR/webauthn/#dictdef-authenticatorselectioncriteria)

Perform a test of user presence (TUP).

### `FIDO2Client.makeCredential(options)`
* `options` [PublicKeyCredentialCreationOptions](https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialcreationoptions)

The `options` parameter was passed from `navigator.credentials.create`.
It must include `publicKey` option is an `PublicKeyCredentialCreationOptions` object 
that describes the options for creating a WebAuthn credential.

### `FIDO2Client.getAssertion(options)`
* `options` [PublicKeyCredentialRequestOptions](https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialrequestoptions)

The `options` parameter was passed from `navigator.credentials.get`.
It must include `publicKey` option is an `PublicKeyCredentialRequestOptions` object that
containing requirements for returned WebAuthn credentials.