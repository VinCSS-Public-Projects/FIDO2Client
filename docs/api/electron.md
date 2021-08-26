# Electron compatible

To use this library on a `BrowserWindow` you must load [preload.js](../../index.ts#29) on that BrowserWindow.

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