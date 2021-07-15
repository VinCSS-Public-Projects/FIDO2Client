import { ipcRenderer } from "electron";

process.once('loaded', () => {
    if (process.platform === 'win32') return;
    if (!navigator.credentials) return;

    Object.assign(navigator.credentials, {
        create: async (options?: CredentialCreationOptions) => {
            const x = await ipcRenderer.invoke('navigator.credentials.create', options).catch(() => {
                throw new DOMException('The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.');
            });
            return x;
        },
        get: async (options?: CredentialRequestOptions) => {
            const x = await ipcRenderer.invoke('navigator.credentials.get', options).catch(() => {
                throw new DOMException('The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.');
            });
            return x;
        }
    });
});