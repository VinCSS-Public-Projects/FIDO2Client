"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultModal = void 0;
const electron_1 = require("electron");
const main_1 = require("electron/main");
const events_1 = __importDefault(require("events"));
const path_1 = __importDefault(require("path"));
const rxjs_1 = require("rxjs");
const symbol_1 = require("../client/symbol");
// prevent quit the app
main_1.app.on('window-all-closed', () => { });
class DefaultModal extends events_1.default {
    constructor() {
        super();
        this.ready = false;
        rxjs_1.fromEvent(electron_1.ipcMain, symbol_1.Fido2EventResponse, (_, status) => status).subscribe(status => {
            this.emit(symbol_1.Fido2EventResponse, status);
        });
        rxjs_1.fromEvent(electron_1.ipcMain, symbol_1.Fido2EventSelectDevice, (_, device) => device).subscribe(device => {
            this.emit(symbol_1.Fido2EventSelectDevice, device);
        });
        rxjs_1.fromEvent(electron_1.ipcMain, symbol_1.Fido2EventPinAvailable, (_, pin) => pin).subscribe(pin => {
            this.emit(symbol_1.Fido2EventPinAvailable, pin);
        });
        rxjs_1.fromEvent(electron_1.ipcMain, symbol_1.Fido2EventCancel, _ => void 0).subscribe(_ => {
            this.window.then(x => x.closable && x.close());
            this.emit(symbol_1.Fido2EventCancel);
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventRequest, request => request).subscribe(request => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventRequest, request));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventDeviceSelected, info => info).subscribe(info => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventDeviceSelected, info));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventDeviceAttach, device => device).subscribe(device => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventDeviceAttach, device));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventKeepAlive, status => status).subscribe(status => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventKeepAlive, status));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventSuccess).subscribe(_ => {
            this.window.then(x => x.closable && x.close());
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventPinValid).subscribe(_ => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventPinValid));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventPinInvalid, retries => retries).subscribe(retries => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventPinInvalid, retries));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventPinAuthBlocked).subscribe(_ => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventPinAuthBlocked));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventPinBlocked).subscribe(_ => {
            this.window.then(x => x.webContents.send(symbol_1.Fido2EventPinBlocked));
        });
        rxjs_1.fromEvent(this, symbol_1.Fido2EventTimeout).subscribe(_ => {
            this.window.then(x => x.closable && x.close());
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
            this.browser.loadFile(path_1.default.join(__dirname, '../../assets/default/index.html')).then(_ => {
                this.browser.show();
                // this.browser.webContents.openDevTools();
                this.ready = true;
                resolve(this.browser);
            });
        });
    }
}
exports.DefaultModal = DefaultModal;
