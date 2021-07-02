"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// For safe espose api to renderer, strip all global declare
electron_1.contextBridge.exposeInMainWorld('api', {
    close() {
        electron_1.ipcRenderer.send('fido2-modal-close');
    },
    acceptRequest() {
        return electron_1.ipcRenderer.send('fido2-event-response', true);
    },
    rejectRequest() {
        return electron_1.ipcRenderer.send('fido2-event-response', false);
    },
    get getRequest() {
        return new Promise((resolve, reject) => electron_1.ipcRenderer.once('fido2-event-request', (_, request) => resolve(request)));
    },
    deviceAttach(listener) {
        electron_1.ipcRenderer.on('fido2-event-device-attach', (_, device) => listener(device));
    },
    selectDevice(device) {
        return new Promise((resolve, reject) => {
            electron_1.ipcRenderer.once('fido2-event-device-selected', (_, info) => resolve(info));
            electron_1.ipcRenderer.send('fido2-event-select-device', device);
        });
    },
    cancelTransaction() {
        return electron_1.ipcRenderer.send('fido2-event-cancel');
    },
    keepAlive(listener) {
        electron_1.ipcRenderer.on('fido2-event-keep-alive', (_, status) => listener(status));
    },
    get transactionSuccess() {
        return new Promise((resolve, reject) => electron_1.ipcRenderer.once('fido2-event-success', () => resolve()));
    },
    enterPin(pin) {
        electron_1.ipcRenderer.send('fido2-event-pin-available', pin);
    },
    get pinValid() {
        return new Promise((resolve, reject) => electron_1.ipcRenderer.once('fido2-event-pin-valid', _ => resolve()));
    },
    pinInvalid(listener) {
        electron_1.ipcRenderer.on('fido2-event-pin-invalid', (_, retries) => listener(retries));
    },
    get pinAuthBlocked() {
        return new Promise((resolve, reject) => electron_1.ipcRenderer.once('fido2-event-pin-auth-blocked', () => resolve()));
    },
    get pinBlocked() {
        return new Promise((resolve, reject) => electron_1.ipcRenderer.once('fido2-event-pin-blocked', () => resolve()));
    },
    message: new Promise((observer) => {
    })
});
