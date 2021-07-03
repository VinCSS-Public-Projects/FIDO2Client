import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { FIDO2Client } from './index';

app.whenReady().then(() => {

    let win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadURL('https://webauthn.cybersecvn.com').then(() => {
        // win.webContents.openDevTools();
        win.maximize();
    });

    let fido2 = new FIDO2Client();
    ipcMain.handle('navigator.credentials.create', (event, options) => fido2.makeCredential(event.sender.getURL(), options));
    ipcMain.handle('navigator.credentials.get', (event, options) => fido2.getAssertion(event.sender.getURL(), options));
});