import { BrowserWindow, ipcMain } from 'electron';
import { app } from 'electron/main';
import path from 'path';
import { fromEvent, Subject } from 'rxjs';
import { IClientObservable, IClientRequest, IFido2DeviceInfo } from '../client/client';
import { Fido2EventSelectDevice, Fido2EventCancel, Fido2EventPinAvailable, Fido2EventResponse, Fido2EventDeviceAttach, Fido2EventDeviceSelected, Fido2EventKeepAlive, Fido2EventPinAuthBlocked, Fido2EventPinBlocked, Fido2EventPinInvalid, Fido2EventPinValid, Fido2EventRequest, Fido2EventNoCredentials } from '../client/event';
import { IFido2Device } from '../fido2/fido2-device-cli';
import { logger } from '../log/debug';


// prevent quit the app
// app.on('window-all-closed', () => { });

export class DefaultModal extends Subject<IClientObservable> {
    private browser!: BrowserWindow;
    private ready: boolean = false;

    constructor() {
        super();

        this.subscribe(value => {
            switch (value.type) {
                case 'fido2-event-request': {
                    let request = value.data as IClientRequest;
                    this.window.then(x => x.webContents.send(Fido2EventRequest, request));
                    break;
                }
                case 'fido2-event-enter-pin': {
                    break;
                }
                case 'fido2-event-set-pin': {
                    break;
                }
                case 'fido2-event-device-attach': {
                    this.window.then(x => x.webContents.send(Fido2EventDeviceAttach, value.data as IFido2Device));
                    break
                }
                case 'fido2-event-pin-invalid': {
                    this.window.then(x => x.webContents.send(Fido2EventPinInvalid, value.data as number));
                    break;
                }
                case 'fido2-event-pin-valid': {
                    this.window.then(x => x.webContents.send(Fido2EventPinValid));
                    break;
                }
                case 'fido2-event-device-selected': {
                    this.window.then(x => x.webContents.send(Fido2EventDeviceSelected, value.data as IFido2DeviceInfo));
                    break;
                }
                case 'fido2-event-pin-auth-blocked': {
                    this.window.then(x => x.webContents.send(Fido2EventPinAuthBlocked));
                    break;
                }
                case 'fido2-event-pin-blocked': {
                    this.window.then(x => x.webContents.send(Fido2EventPinBlocked));
                    break;
                }
                case 'fido2-event-success': {
                    this.window.then(x => x.closable && x.close());
                    break;
                }
                case 'fido2-event-keep-alive': {
                    this.window.then(x => x.webContents.send(Fido2EventKeepAlive, value.data as number));
                    break;
                }
                case 'fido2-event-timeout': {
                    this.window.then(x => x.closable && x.close());
                    break;
                }
                case 'fido2-event-no-credentials':
                    this.window.then(x => x.webContents.send(Fido2EventNoCredentials));
                    break;
                case 'fido2-event-error':
                case 'fido2-event-cancel':
                    break;
                default:
                    break;
            }
        });

        fromEvent<boolean>(ipcMain, Fido2EventResponse, (_, status) => status).subscribe(status => {
            this.next({ type: 'fido2-event-response', data: status });
        });

        fromEvent<IFido2Device>(ipcMain, Fido2EventSelectDevice, (_, device) => device).subscribe(device => {
            this.next({ type: 'fido2-event-select-device', data: device })
        });

        fromEvent<string>(ipcMain, Fido2EventPinAvailable, (_, pin) => pin).subscribe(pin => {
            this.next({ type: 'fido2-event-pin-available', data: pin });
        });

        fromEvent<void>(ipcMain, Fido2EventCancel, _ => void 0).subscribe(_ => {
            this.window.then(x => x.closable && x.close());
            this.next({ type: 'fido2-event-cancel' });
        });
    }

    private get window(): Promise<BrowserWindow> {
        // logger.debug(new Error().stack)
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