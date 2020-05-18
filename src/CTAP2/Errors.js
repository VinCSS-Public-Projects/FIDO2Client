let errors = {
    SUCCESS: 0x00,
    INVALID_COMMAND: 0x01,
    INVALID_PARAMETER: 0x02,
    INVALID_LENGTH: 0x03,
    INVALID_SEQ: 0x04,
    TIMEOUT: 0x05,
    CHANNEL_BUSY: 0x06,
    LOCK_REQUIRED: 0x0A,
    INVALID_CHANNEL: 0x0B,
    CBOR_UNEXPECTED_TYPE: 0x11,
    INVALID_CBOR: 0x12,
    INVALID_CBOR_TYPE: 0x13,
    MISSING_PARAMETER: 0x14,
    LIMIT_EXCEEDED: 0x15,
    UNSUPPORTED_EXTENSION: 0x16,
    CREDENTIAL_EXCLUDED: 0x19,
    PROCESSING: 0x21,
    INVALID_CREDENTIAL: 0x22,
    USER_ACTION_PENDING: 0x23,
    OPERATION_PENDING: 0x24,
    NO_OPERATIONS: 0x25,
    UNSUPPORTED_ALGORITHM: 0x26,
    OPERATION_DENIED: 0x27,
    KEY_STORE_FULL: 0x28,
    NOT_BUSY: 0x29,
    NO_OPERATION_PENDING: 0x2A,
    UNSUPPORTED_OPTION: 0x2B,
    INVALID_OPTION: 0x2C,
    KEEPALIVE_CANCEL: 0x2D,
    NO_CREDENTIALS: 0x2E,
    USER_ACTION_TIMEOUT: 0x2F,
    NOT_ALLOWED: 0x30,
    PIN_INVALID: 0x31,
    PIN_BLOCKED: 0x32,
    PIN_AUTH_INVALID: 0x33,
    PIN_AUTH_BLOCKED: 0x34,
    PIN_NOT_SET: 0x35,
    PIN_REQUIRED: 0x36,
    PIN_POLICY_VIOLATION: 0x37,
    PIN_TOKEN_EXPIRED: 0x38,
    REQUEST_TOO_LARGE: 0x39,
    ACTION_TIMEOUT: 0x3A,
    UP_REQUIRED: 0x3B,
    OTHER: 0x7F,
    SPEC_LAST: 0xDF,
    EXTENSION_FIRST: 0xE0,
    EXTENSION_LAST: 0xEF,
    VENDOR_FIRST: 0xF0,
    VENDOR_LAST: 0xFF,
};

class CTAP2Error extends Error {

    /**
     *
     * @param code
     */
    constructor(code) {
        super(`${Object.keys(errors).find(x => errors[x] === code)} (0x${code.toString(16)})`);
        this.name = 'CTAP2Error';
    }
}

class CTAP2ErrorPINInvalid extends Error {

    /**
     *
     * @param props
     */
    constructor(props) {
        super('PIN invalid');
        this.name = 'CTAP2ErrorPINInvalid';
    }
}

class CTAP2ErrorNoCredentials extends Error {

    /**
     *
     * @param props
     */
    constructor(props) {
        super('No credentials');
        this.name = 'CTAP2ErrorNoCredentials';
    }
}

class CTAP2ErrorPINAuthBlocked extends Error {

    /**
     *
     * @param props
     */
    constructor(props) {
        super('PIN auth locked');
        this.name = 'CTAP2ErrorPINAuthBlocked';
        Error.captureStackTrace(this, CTAP2ErrorPINAuthBlocked);
    }
}

class CTAP2ErrorPINBlocked extends Error {

    constructor() {
        super('PIN blocked');
        this.name = 'CTAP2ErrorPINBlocked';
        Error.captureStackTrace(this, CTAP2ErrorPINBlocked);
    }
}

class CTAP2KeepAliveCancel extends Error {

    constructor() {
        super('CTAP2 Cancel');
        this.name = 'CTAP2KeepAliveCancel';
        Error.captureStackTrace(this, CTAP2KeepAliveCancel);
    }
}

class CTAP2ErrorPINRequired extends Error {

    constructor() {
        super('PIN required');
        this.name = 'CTAP2ErrorPINRequired';
        Error.captureStackTrace(this, CTAP2ErrorPINRequired);
    }
}

class CTAP2ErrorActionTimeout extends Error {

    constructor() {
        super('Action timeout');
        this.name = 'CTAP2ErrorActionTimeout';
        Error.captureStackTrace(this, CTAP2ErrorActionTimeout);
    }
}


/**
 * ===============================================
 * Export
 */

module.exports.CTAP2ErrorCode = errors;

/**
 *
 * @type {CTAP2Error}
 */
module.exports.CTAP2Error = CTAP2Error;

/**
 *
 * @type {CTAP2ErrorPINInvalid}
 */
module.exports.CTAP2ErrorPINInvalid = CTAP2ErrorPINInvalid;

/**
 *
 * @type {CTAP2ErrorNoCredentials}
 */
module.exports.CTAP2ErrorNoCredentials = CTAP2ErrorNoCredentials;

/**
 *
 * @type {CTAP2ErrorPINAuthBlocked}
 */
module.exports.CTAP2ErrorPINAuthBlocked = CTAP2ErrorPINAuthBlocked;

/**
 *
 * @type {CTAP2ErrorPINBlocked}
 */
module.exports.CTAP2ErrorPINBlocked = CTAP2ErrorPINBlocked;

/**
 *
 * @type {CTAP2KeepAliveCancel}
 */
module.exports.CTAP2KeepAliveCancel = CTAP2KeepAliveCancel;

/**
 *
 * @type {CTAP2ErrorPINRequired}
 */
module.exports.CTAP2ErrorPINRequired = CTAP2ErrorPINRequired;

/**
 *
 * @type {CTAP2ErrorActionTimeout}
 */
module.exports.CTAP2ErrorActionTimeout = CTAP2ErrorActionTimeout;