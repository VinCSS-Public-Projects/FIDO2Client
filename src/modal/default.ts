import { BrowserWindow, ipcMain } from 'electron';
import { app } from 'electron/main';
import EventEmitter from 'events';
import path from 'path';
import { fromEvent } from 'rxjs';
import { Fido2EventDeviceAttach, Fido2EventSelectDevice, Fido2EventKeepAlive, Fido2EventDeviceSelected, Fido2EventSuccess, Fido2EventCancel, Fido2EventPinInvalid, Fido2EventPinAuthBlocked, Fido2EventPinBlocked, Fido2EventPinAvailable, Fido2EventPinValid, Fido2EventTimeout, Fido2EventResponse, Fido2EventRequest } from '../client/symbol';
import { IFido2Device } from '../fido2/fido2-device-cli';


// prevent quit the app
app.on('window-all-closed', () => { });

export class DefaultModal extends EventEmitter {
    private browser!: BrowserWindow;
    private ready: boolean = false;
    private internalEvent!: EventEmitter;

    constructor() {
        super();

        fromEvent<boolean>(ipcMain, Fido2EventResponse, (_, status) => status).subscribe(status => {
            this.emit(Fido2EventResponse, status);
        });

        fromEvent<IFido2Device>(ipcMain, Fido2EventSelectDevice, (_, device) => device).subscribe(device => {
            this.emit(Fido2EventSelectDevice, device)
        });

        fromEvent<string>(ipcMain, Fido2EventPinAvailable, (_, pin) => pin).subscribe(pin => {
            this.emit(Fido2EventPinAvailable, pin);
        });

        fromEvent<void>(ipcMain, Fido2EventCancel, _ => void 0).subscribe(_ => {
            this.window.then(x => x.closable && x.close());
            this.emit(Fido2EventCancel);
        });

        fromEvent<boolean>(this, Fido2EventRequest, request => request).subscribe(request => {
            this.window.then(x => x.webContents.send(Fido2EventRequest, request));
        });

        fromEvent<number>(this, Fido2EventDeviceSelected, info => info).subscribe(info => {
            this.window.then(x => x.webContents.send(Fido2EventDeviceSelected, info));
        });

        fromEvent<IFido2Device>(this, Fido2EventDeviceAttach, device => device).subscribe(device => {
            this.window.then(x => x.webContents.send(Fido2EventDeviceAttach, device));
        });

        fromEvent<number>(this, Fido2EventKeepAlive, status => status).subscribe(status => {
            this.window.then(x => x.webContents.send(Fido2EventKeepAlive, status));
        });

        fromEvent(this, Fido2EventSuccess).subscribe(_ => {
            this.window.then(x => x.closable && x.close());
        });

        fromEvent(this, Fido2EventPinValid).subscribe(_ => {
            this.window.then(x => x.webContents.send(Fido2EventPinValid));
        });

        fromEvent<number>(this, Fido2EventPinInvalid, retries => retries).subscribe(retries => {
            this.window.then(x => x.webContents.send(Fido2EventPinInvalid, retries));
        })

        fromEvent(this, Fido2EventPinAuthBlocked).subscribe(_ => {
            this.window.then(x => x.webContents.send(Fido2EventPinAuthBlocked));
        });

        fromEvent(this, Fido2EventPinBlocked).subscribe(_ => {
            this.window.then(x => x.webContents.send(Fido2EventPinBlocked));
        });

        fromEvent(this, Fido2EventTimeout).subscribe(_ => {
            this.window.then(x => x.closable && x.close());
        });
    }

    private get window(): Promise<BrowserWindow> {
        return new Promise((resolve, reject) => {
            if (this.ready) return resolve(this.browser);
            this.browser = new BrowserWindow({
                width: 480,
                height: 320,
                hasShadow: true,
                resizable: false,
                parent: BrowserWindow.getFocusedWindow() || undefined,
                transparent: false,
                /**
                 * @TODO fix frameless on OSX.
                 */
                frame: process.platform === 'darwin' ? true : false,
                useContentSize: true,
                modal: true,
                show: false,
                alwaysOnTop: true,
                webPreferences: {
                    nodeIntegration: false,
                    enableRemoteModule: false,
                    contextIsolation: true,
                    sandbox: true,
                    webSecurity: true,
                    experimentalFeatures: false,
                    worldSafeExecuteJavaScript: false,
                    preload: path.join(__dirname, 'preload.js')
                }
            });
            this.browser.once('closed', () => this.ready = false);
            this.browser.loadFile(path.join(__dirname, '../../../assets/default/index.html')).then(_ => {
                this.browser.show();
                // this.browser.webContents.openDevTools();
                this.ready = true;
                resolve(this.browser);
            });
        })
    }
}