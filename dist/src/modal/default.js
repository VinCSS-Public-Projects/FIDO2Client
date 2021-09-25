"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultModal = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const rxjs_1 = require("rxjs");
const event_1 = require("../client/event");
const debug_1 = require("../log/debug");
class DefaultModal extends rxjs_1.Subject {
    constructor() {
        super();
        this.ready = false;
        this.subscribe(value => {
            switch (value.type) {
                case 'fido2-event-request': {
                    let request = value.data;
                    this.window.then(x => x.webContents.send(event_1.Fido2EventRequest, request));
                    break;
                }
                case 'fido2-event-device-attach': {
                    this.window.then(x => x.webContents.send(event_1.Fido2EventDeviceAttach, value.data));
                    break;
                }
                case 'fido2-event-device-detach':
                    this.window.then(x => x.webContents.send(event_1.Fido2EventDeviceDetach, value.data));
                    break;
                case 'fido2-event-pin-invalid': {
                    this.window.then(x => x.webContents.send(event_1.Fido2EventPinInvalid, value.data));
                    break;
                }
                case 'fido2-event-pin-valid': {
                    this.window.then(x => x.webContents.send(event_1.Fido2EventPinValid));
                    break;
                }
                case 'fido2-event-device-selected': {
                    debug_1.logger.debug(value.data);
                    this.window.then(x => x.webContents.send(event_1.Fido2EventDeviceSelected, value.data));
                    break;
                }
                case 'fido2-event-pin-auth-blocked': {
                    this.window.then(x => x.webContents.send(event_1.Fido2EventPinAuthBlocked));
                    break;
                }
                case 'fido2-event-pin-blocked': {
                    this.window.then(x => x.webContents.send(event_1.Fido2EventPinBlocked));
                    break;
                }
                case 'fido2-event-success': {
                    this.window.then(x => x.closable && x.close());
                    break;
                }
                case 'fido2-event-keep-alive': {
                    this.window.then(x => x.webContents.send(event_1.Fido2EventKeepAlive, value.data));
                    break;
                }
                case 'fido2-event-timeout': {
                    this.window.then(x => x.webContents.send(event_1.Fido2EventTimeout));
                    break;
                }
                case 'fido2-event-no-credentials':
                    this.window.then(x => x.webContents.send(event_1.Fido2EventNoCredentials));
                    break;
                case 'fido2-event-error':
                case 'fido2-event-cancel':
                case 'fido2-event-response':
                case 'fido2-event-select-device':
                case 'fido2-event-pin-available':
                case 'fido2-event-keep-alive-cancel':
                case 'fido2-event-enter-pin':
                case 'fido2-event-set-pin':
                    break;
                default:
                    /**
                     * Shouldn't go there.
                     */
                    debug_1.logger.debug(`drop unknown notify with type=${value.type}, data=${value.data}`);
                    break;
            }
        });
        (0, rxjs_1.fromEvent)(electron_1.ipcMain, event_1.Fido2EventResponse, (_, status) => status).subscribe(status => {
            this.next({ type: 'fido2-event-response', data: status });
        });
        (0, rxjs_1.fromEvent)(electron_1.ipcMain, event_1.Fido2EventSelectDevice, (_, device) => device).subscribe(device => {
            this.next({ type: 'fido2-event-select-device', data: device });
        });
        (0, rxjs_1.fromEvent)(electron_1.ipcMain, event_1.Fido2EventPinAvailable, (_, pin) => pin).subscribe(pin => {
            this.next({ type: 'fido2-event-pin-available', data: pin });
        });
        (0, rxjs_1.fromEvent)(electron_1.ipcMain, event_1.Fido2EventCancel, () => void 0).subscribe(() => {
            this.window.then(x => x.closable && x.close());
            this.next({ type: 'fido2-event-cancel' });
        });
        (0, rxjs_1.fromEvent)(electron_1.ipcMain, event_1.Fido2EventError, (_, e) => e).subscribe(e => {
            this.window.then(x => x.closable && x.close());
            this.next({ type: 'fido2-event-error', data: e });
        });
    }
    get window() {
        return new Promise((resolve, reject) => {
            if (this.ready)
                return resolve(this.browser);
            this.browser = new electron_1.BrowserWindow({
                width: 480,
                height: 320,
                hasShadow: true,
                resizable: false,
                parent: electron_1.BrowserWindow.getFocusedWindow() || undefined,
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
                    preload: path_1.default.join(__dirname, 'preload.js')
                }
            });
            this.browser.once('closed', () => this.ready = false);
            this.browser.loadFile(path_1.default.join(__dirname, '../../../assets/default/index.html')).then(_ => {
                this.browser.show();
                // this.browser.webContents.openDevTools();
                this.ready = true;
                resolve(this.browser);
            });
        });
    }
}
exports.DefaultModal = DefaultModal;
//# sourceMappingURL=default.js.map