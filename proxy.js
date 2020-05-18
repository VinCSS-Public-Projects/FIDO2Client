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