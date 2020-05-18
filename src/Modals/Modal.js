let {BrowserWindow, ipcMain} = require('electron');
let Promise = require('bluebird');
let {EventEmitter} = require('events');
let path = require('path');

class Modal extends EventEmitter {

    constructor() {
        super();

        /**
         *
         * @type {Electron.BrowserWindow} The modal window
         */
        this.modalWin = undefined;
        this.channel = undefined;

        ipcMain.on('fido2-modal-enter-pin', (e, pin) => {
            this.emit('fido2-enter-pin', pin);
        });
    }

    /**
     *
     * @returns {Promise}
     */
    getInstance = () => new Promise((resolve) => {
        if (this.modalWin && !this.modalWin.isDestroyed()) return resolve(this.modalWin);
        this.modalWin = new BrowserWindow({
            width: 480,
            height: 320,
            resizable: false,
            parent: BrowserWindow.getFocusedWindow(),
            transparent: false,
            frame: false,
            modal: true,
            show: false,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true
            }
        });
        this.modalWin.hide();
        this.modalWin.webContents.once('destroyed', () => {
            this.modalWin = undefined;
        });
        this.modalWin.loadFile(path.join(__dirname, '../../assets/default/index.html')).then(() => {
            this.modalWin.show();
            // this.modalWin.webContents.openDevTools();
            resolve(this.modalWin);
        });
    });

    deviceNotFound = () => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-no-device');
        })
    };

    actionTimeout = () => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-action-timeout');
        })
    };

    selectDevice = (devices) => new Promise((resolve, reject) => {

        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-select-device', devices);
        });

        ipcMain.once('fido2-modal-select-device', (e, index) => {
            resolve(index);
        });

        ipcMain.once('fido2-modal-cancel', () => {
            console.log('Cancel select device');
            reject();
        });
    });

    /**
     * Return a promise, resolve a PIN when user enter PIN and reject on user cancel request.
     * @returns {Promise}
     */
    enterPIN = () => new Promise((resolve, reject) => {

        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-enter-pin');
        });

        ipcMain.once('fido2-modal-cancel', () => {
            console.log('Cancel enter pin');
            reject();
        });
    });

    /**
     * Return a promise, resolve current and new PIN.
     * @returns {Promise}
     */
    newPIN = () => new Promise((resolve, reject) => {

        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-new-pin');
        });

        ipcMain.once('fido2-modal-new-pin', (e, newPin) => {
            resolve(newPin);
        });

        ipcMain.once('fido2-modal-cancel', () => {
            console.log('Cancel new pin');
            reject();
        });
    });

    /**
     * Send invalid PIN event to target window.
     * @param retries {number}
     */
    invalidPIN = (retries) => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-invalid-pin', retries);
        });
    };

    /**
     * Send to render process when PIN correct.
     * @param origin {string}
     */
    validPIN = (origin) => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-valid-pin', origin);
        });
    };

    /**
     *
     * @param origin {string}
     */
    validPINMakeResidentKey = (origin) => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-make-resident-key-valid-pin', origin);
        })
    };

    pinAuthLocked = () => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-pin-auth-blocked');
        });
    };

    pinLocked = () => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-pin-blocked');
        });
    };

    /**
     * Send no credentials event to target window.
     */
    noCredentials = () => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-no-credentials');
        });
    };

    /**
     * Get/Create credential success. Send event to target window.
     */
    success = () => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-success');
        });
    };

    /**
     *
     * @param residentKeys {Array<Assertion>}
     * @param origin {string}
     */
    selectResidentKey = (residentKeys, origin) => new Promise((resolve) => {
        this.getInstance().then((win) => {
            win.webContents.send('fido2-modal-select-resident-key', residentKeys, origin);
        });

        ipcMain.once('fido2-modal-select-resident-key', (e, index) => {
            resolve(index);
        })
    });
}

/**
 *
 * @type {Modal} Default FIDO2 client modal.
 */
module.exports.modal = new Modal();