let { ipcRenderer, contextBridge } = require('electron');

/**
 * Optional.
 */
// window.require = require;

// contextBridge.exposeInMainWorld('navigator', {
//     create: async (options) => {
//         const x = await ipcRenderer.invoke('navigator.credentials.create', options);
//         x.getClientExtensionResults = () => {
//             return {};
//         };
//         x.rawId = x.rawId?.buffer;
//         x.response.clientDataJSON = x.response.clientDataJSON?.buffer;
//         x.response.attestationObject = x.response.attestationObject?.buffer;
//         return x;
//     },
//     get: async (options) => {
//         const x = await ipcRenderer.invoke('navigator.credentials.get', options);
//         x.getClientExtensionResults = () => {
//             return {};
//         };
//         x.rawId = x.rawId?.buffer;
//         x.response.clientDataJSON = x.response.clientDataJSON?.buffer;
//         x.response.authenticatorData = x.response.authenticatorData?.buffer;
//         x.response.signature = x.response.signature?.buffer;
//         x.response.userHandle = x.response.userHandle?.buffer;
//         return x;
//     }
// });

process.once('loaded', () => {
    global.ipcRenderer = ipcRenderer;

    // if (process.platform === 'win32') return;
    if (!navigator.credentials) return;

    console.log('FIDO2 client preload');
    navigator.credentials.create = (publicCreateOptions) => {
        return ipcRenderer.invoke('navigator.credentials.create', publicCreateOptions).then((x) => {
            x.getClientExtensionResults = () => {
                return {}
            };
            x.rawId = x.rawId?.buffer;
            x.response.clientDataJSON = x.response.clientDataJSON?.buffer;
            x.response.attestationObject = x.response.attestationObject?.buffer;
            return x;
        });
    };
    navigator.credentials.get = (publicGetOptions) => {
        return ipcRenderer.invoke('navigator.credentials.get', publicGetOptions).then((x) => {
            x.getClientExtensionResults = () => {
                return {}
            };
            x.rawId = x.rawId?.buffer;
            x.response.clientDataJSON = x.response.clientDataJSON?.buffer;
            x.response.authenticatorData = x.response.authenticatorData?.buffer;
            x.response.signature = x.response.signature?.buffer;
            x.response.userHandle = x.response.userHandle?.buffer;
            return x;
        });
    };
});