"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
process.once('loaded', () => {
    if (process.platform === 'win32')
        return;
    if (!navigator.credentials)
        return;
    Object.assign(navigator.credentials, {
        create: async (options) => {
            const x = await electron_1.ipcRenderer.invoke('navigator.credentials.create', options).catch(() => {
                throw new DOMException('The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.');
            });
            return x;
        },
        get: async (options) => {
            const x = await electron_1.ipcRenderer.invoke('navigator.credentials.get', options).catch(() => {
                throw new DOMException('The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.');
            });
            return x;
        }
    });
});
