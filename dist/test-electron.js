"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const index_1 = require("./index");
electron_1.app.commandLine.appendSwitch('ignore-certificate-errors');
electron_1.app.whenReady().then(() => {
    let win = new electron_1.BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: false,
            preload: index_1.PreloadPath,
        },
    });
    win.loadURL('https://webauthn.cybersecvn.com').then(() => {
        // win.webContents.openDevTools();
        win.maximize();
    });
    let fido2 = new index_1.FIDO2Client({
        strictMode: true
    });
    electron_1.ipcMain.handle('navigator.credentials.create', (event, options) => fido2.makeCredential(event.sender.getURL(), options));
    electron_1.ipcMain.handle('navigator.credentials.get', (event, options) => fido2.getAssertion(event.sender.getURL(), options));
});
//# sourceMappingURL=test-electron.js.map