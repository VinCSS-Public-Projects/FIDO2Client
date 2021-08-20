"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
process.once('loaded', () => {
    console.log(process.env);
    if (process.platform === 'win32' && !(process.env && process.env['FIDO2_CLIENT_FORCE_PRELOAD'] === 'TRUE'))
        return;
    if (!navigator.credentials)
        return;
    const { get, create } = navigator.credentials;
    Object.assign(navigator.credentials, {
        create: async (options) => {
            /**
             * Only handle WebAuthn options, other options should fallback built-in handler
             */
            if (typeof options?.publicKey !== 'object')
                return create(options);
            /**
             * Invoke create request to main process.
             */
            const x = await electron_1.ipcRenderer.invoke('navigator.credentials.create', options).catch(() => {
                throw new DOMException('The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.');
            });
            return x;
        },
        get: async (options) => {
            /**
             * Only handle WebAuthn options, other options should fallback built-in handler
             */
            if (typeof options?.publicKey !== 'object')
                return get(options);
            /**
             * Invoke create request to main process.
             */
            const x = await electron_1.ipcRenderer.invoke('navigator.credentials.get', options).catch(() => {
                throw new DOMException('The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.');
            });
            return x;
        }
    });
});
//# sourceMappingURL=preload.js.map