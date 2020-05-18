class FIDO2ClientErrorDeviceNotFound extends Error {

    constructor() {
        super('FIDO2 device not found');
        this.name = 'FIDO2ClientErrorDeviceNotFound';
        Error.captureStackTrace(this, FIDO2ClientErrorDeviceNotFound);
    }
}

class FIDO2ClientMissingEventListener extends Error {

    /**
     *
     * @param eventName {string}
     */
    constructor(eventName) {
        super(`Missing FIDO2 client event listener for ${eventName}`);
        this.name = 'FIDO2ClientMissingEventListener';
        Error.captureStackTrace(this, FIDO2ClientMissingEventListener);
    }
}

/**
 *
 * @type {FIDO2ClientErrorDeviceNotFound}
 */
module.exports.FIDO2ClientErrorDeviceNotFound = FIDO2ClientErrorDeviceNotFound;

/**
 *
 * @type {FIDO2ClientMissingEventListener}
 */
module.exports.FIDO2ClientMissingEventListener = FIDO2ClientMissingEventListener;