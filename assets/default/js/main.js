let {ipcRenderer, remote} = require('electron'),
    self = remote.getCurrentWindow();

// ipcRenderer.once('fido2-modal-force-close', onCancel());

ipcRenderer.once('fido2-modal-no-device', (e, origin) => {
    // document.getElementById('fido2-modal-select-device').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-no-device-title').innerText = `Use your security with ${htmlEntitiesEncode(origin)}`;
    document.getElementById('fido2-modal-no-device').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-action-timeout', () => {
    document.getElementById('fido2-modal-touch').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-action-timeout').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-success', () => {
    self.close();
});

ipcRenderer.once('fido2-modal-enter-pin', () => {
    document.getElementById('fido2-modal-select-device').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-enter-pin').classList.add('fido2-modal-show');
    document.getElementById('fido2-modal-pin').focus();
});

ipcRenderer.once('fido2-modal-valid-pin', (e, origin) => {
    document.getElementById('fido2-modal-enter-pin').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-set-pin').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-touch-title').innerText = `Use your security with ${htmlEntitiesEncode(origin)}`;
    document.getElementById('fido2-modal-touch').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-make-resident-key-valid-pin', (e, origin) => {
    document.getElementById('fido2-modal-enter-pin').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-set-pin').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-resident-key-touch-title').innerText = `Use your security with ${htmlEntitiesEncode(origin)}`;
    document.getElementById('fido2-modal-resident-key-touch').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-no-credentials', () => {
    document.getElementById('fido2-modal-touch').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-set-pin').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-no-credentials').classList.add('fido2-modal-show');
});

/**
 * Emit by main process on resident key mode.
 */
ipcRenderer.once('fido2-modal-select-resident-key', (e, residentKeys, origin) => {

    let table = document.getElementById('fido2-modal-resident-key-table');
    residentKeys.forEach((cred, index) => {
        let cell = table.insertRow(index).insertCell(0);
        cell.innerHTML = `<div class="fido2-account" id="fido2-modal-resident-key-row"
                                resident-key-index="${index}" style="pointer-events: none;">
                            <svg class="svg-inline--fa fa-user-shield fa-w-20 default-avatar" 
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                            <path fill="currentColor" 
                            d="M622.3 271.1l-115.2-45c-4.1-1.6-12.6-3.7-22.2 0l-115.2 45c-10.7 4.2-17.7 14-17.7 24.9 0 111.6 68.7 188.8 132.9 213.9 9.6 3.7 18 1.6 22.2 0C558.4 489.9 640 420.5 640 296c0-10.9-7-20.7-17.7-24.9zM496 462.4V273.3l95.5 37.3c-5.6 87.1-60.9 135.4-95.5 151.8zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm96 40c0-2.5.8-4.8 1.1-7.2-2.5-.1-4.9-.8-7.5-.8h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c6.8 0 13.3-1.5 19.2-4-54-42.9-99.2-116.7-99.2-212z"> </path></svg>
                            <div class="fido2-flex-info">
                                <div class="fido2-flex-info-display-name" id="fido2-flex-info-display-name">
                                    ${htmlEntitiesEncode(cred.user.displayName)}
                                </div>
                                <div class="fido2-flex-info-name" id="fido2-flex-info-name">
                                    ${htmlEntitiesEncode(cred.user.name)}
                                </div>
                            </div>
                        </div>`;
        cell.onclick = (e) => {
            let index = e.target.querySelector('#fido2-modal-resident-key-row').getAttribute('resident-key-index');
            ipcRenderer.send('fido2-modal-select-resident-key', parseInt(index));
            self.close();
        };
    });

    document.getElementById('fido2-modal-touch').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-resident-key-title').innerText = `Use your security with ${htmlEntitiesEncode(origin)}`;
    document.getElementById('fido2-modal-select-resident-key').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-select-device', (e, devices) => {

    let table = document.getElementById('fido2-modal-device-table');
    devices.forEach((device, index) => {
        let cell = table.insertRow(index).insertCell(0);
        cell.innerHTML = `<div class="fido2-account" id="fido2-modal-device-row"
                                device-index="${index}" style="pointer-events: none;">
<!--                                <svg focusable="false" class="svg-inline&#45;&#45;fa fa-key fa-w-16 default-avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"> </path></svg>-->
                                <div class="fido2-flex-info">
                                <div class="fido2-flex-info-display-name" id="fido2-flex-info-display-name">
                                    ${htmlEntitiesEncode(device.product)}
                                </div>
                                <div class="fido2-flex-info-name" id="fido2-flex-info-name">
                                    ${htmlEntitiesEncode(device.serialNumber)}
                                </div>
                            </div>
                            <svg focusable="false" class="svg-inline--fa fa-ellipsis-h fa-w-16 wink-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"> </path></svg>
                        </div>`;
        cell.onclick = (e) => {
            let index = e.target.querySelector('#fido2-modal-device-row').getAttribute('device-index');
            ipcRenderer.send('fido2-modal-select-device', parseInt(index));
        }
    });
    document.getElementById('fido2-modal-select-device').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-pin-auth-blocked', () => {
    document.getElementById('fido2-modal-enter-pin').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-pin-auth-blocked').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-pin-blocked', () => {
    document.getElementById('fido2-modal-enter-pin').classList.remove('fido2-modal-show');
    document.getElementById('fido2-modal-pin-blocked').classList.add('fido2-modal-show');
});

ipcRenderer.once('fido2-modal-new-pin', () => {
    document.getElementById('fido2-modal-set-pin').classList.add('fido2-modal-show');
    document.getElementById('fido2-modal-set-pin-0').focus();
});

ipcRenderer.on('fido2-modal-invalid-pin', (e, retries) => {

    document.getElementById('fido2-modal-enter-pin-title').innerText =
        retries <= 4 ? `Invalid PIN. You have ${retries} attempts remaining.` : 'Invalid PIN.';

    document.getElementById('fido2-modal-enter-pin-title').classList.toggle('fido2-shake');
    setTimeout(() => {
        document.getElementById('fido2-modal-enter-pin-title').classList.toggle('fido2-shake');
    }, 500);
    document.getElementById('fido2-modal-pin').value = '';
});

ipcRenderer.once('fido2-modal-change-pin', () => {
    // TODO
});


/**
 * ====================================================================
 * Common function: validator, checker, ...
 */


/**
 * Send cancel event back to main process and close modal.
 */
let onCancel = () => {
    ipcRenderer.send('fido2-modal-cancel');
    self.close();
};

/**
 * Check PIN policy
 * @param pin {string}
 * @returns {string}
 */
let pinPolicy = (pin) => {

    // TODO
    if (pin) console.log(1);
    return '';
};

/**
 *
 * @param str
 * @returns {string}
 */
let htmlEntitiesEncode = (str) => {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

/**
 * Cancel when user press ESC.
 * @param e {KeyboardEvent}
 */
document.onkeydown = (e) => {
    if (e.code === 'Escape') onCancel();
};

/**
 * Send PIN back to main process and wait for ORIGIN returned. After PIN valid, the modal need to ask user
 * for allow those ORIGIN use your security key.
 * @returns {boolean}
 */
document.forms[0].onsubmit = () => {
    let pin = document.getElementById('fido2-modal-pin').value,
        result = pinPolicy(pin);

    if (result) {
        console.log(`PIN policy: ${result}`);
        return false;
    }
    ipcRenderer.send('fido2-modal-enter-pin', pin);
    return false;
};

/**
 *
 * @returns {boolean}
 */
document.forms[1].onsubmit = () => {
    let pin = document.getElementById('fido2-modal-set-pin-0').value,
        pinConfirm = document.getElementById('fido2-modal-set-pin-1').value,
        result = pinPolicy(pin);

    if (result) {
        console.log(`PIN policy: ${result}`);
        document.getElementById('fido2-policy-new-pin').innerText = result;
        return false;
    }
    if (pin === pinConfirm) {
        ipcRenderer.send('fido2-modal-new-pin', pin);
    } else {
        document.getElementById('fido2-policy-new-pin').innerText = 'The PINs you entered don\'t match';
    }

    return false;
};

/**
 * ====================================================================
 */