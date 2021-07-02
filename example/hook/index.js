let { app, BrowserWindow, ipcMain } = require('electron');
const { FIDO2Client, PreloadPath } = require('fido2client');

app.allowRendererProcessReuse = true;
app.whenReady().then(() => {

    let win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: false,
            preload: PreloadPath
        }
    });

    win.loadURL('https://webauthn.io').then(() => {
        win.webContents.openDevTools();
        console.log('Done');
    });


    let fido2 = new FIDO2Client();

    ipcMain.handle('navigator.credentials.create', (event, publicCreateOptions) => {
        return fido2.makeCredential(publicCreateOptions, event.sender.getURL());
    });

    ipcMain.handle('navigator.credentials.get', (event, publicGetOptions) => {
        return fido2.getAssertion(publicGetOptions, event.sender.getURL());
    });
});