import { contextBridge, ipcRenderer } from "electron";
import { IpcRendererApi, ModalMessage, ModalRequest } from "./modal";

// For safe espose api to renderer, strip all global declare
contextBridge.exposeInMainWorld('api', {
    close(): void {
        ipcRenderer.send('fido2-modal-close');
    },
    acceptRequest(): void {
        return ipcRenderer.send('fido2-event-response', true);
    },
    rejectRequest(): void {
        return ipcRenderer.send('fido2-event-response', false);
    },
    get getRequest(): Promise<ModalRequest> {
        return new Promise<ModalRequest>((resolve, reject) => ipcRenderer.once('fido2-event-request', (_, request) => resolve(request)));
    },
    deviceAttach(listener: (device: any) => void): void {
        ipcRenderer.on('fido2-event-device-attach', (_, device) => listener(device));
    },
    deviceDetach(listener: (device: any) => void): void {
        ipcRenderer.on('fido2-event-device-detach', (_, device) => listener(device));
    },
    selectDevice(device: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            ipcRenderer.once('fido2-event-device-selected', (_, info) => resolve(info));
            ipcRenderer.send('fido2-event-select-device', device);
        });
    },
    cancelTransaction(): void {
        return ipcRenderer.send('fido2-event-cancel');
    },
    keepAlive(listener: (status: number) => void): void {
        ipcRenderer.on('fido2-event-keep-alive', (_, status) => listener(status));
    },
    error(e: string): void {
        ipcRenderer.send('fido2-event-error', e);
    },
    get transactionSuccess(): Promise<void> {
        return new Promise<void>((resolve, reject) => ipcRenderer.once('fido2-event-success', () => resolve()));
    },
    enterPin(pin: string): void {
        ipcRenderer.send('fido2-event-pin-available', pin);
    },
    get pinValid(): Promise<void> {
        return new Promise<void>((resolve, reject) => ipcRenderer.once('fido2-event-pin-valid', _ => resolve()));
    },
    pinInvalid(listener: (retries: number) => void): void {
        ipcRenderer.on('fido2-event-pin-invalid', (_, retries) => listener(retries));
    },
    get pinAuthBlocked(): Promise<void> {
        return new Promise<void>((resolve, reject) => ipcRenderer.once('fido2-event-pin-auth-blocked', () => resolve()));
    },
    get pinBlocked(): Promise<void> {
        return new Promise<void>((resolve, reject) => ipcRenderer.once('fido2-event-pin-blocked', () => resolve()));
    },
    get noCredentials(): Promise<void> {
        return new Promise<void>((resolve, reject) => ipcRenderer.once('fido2-event-no-credentials', () => resolve()));
    },
    get timeout(): Promise<void> {
        return new Promise<void>((resolve, reject) => ipcRenderer.once('fido2-event-timeout', () => resolve()));
    }
} as IpcRendererApi);