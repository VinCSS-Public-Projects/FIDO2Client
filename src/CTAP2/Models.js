const cbor = require('cbor');
const {GET_INFO_CBOR, CLIENT_PIN_CBOR, ATTESTATION_CBOR, ASSERTION_CBOR} = require('./Constants');

class InfoResp {

    /**
     *
     * @param cborEncode
     */
    constructor(cborEncode) {

        let map = cbor.decodeAllSync(cborEncode);
        this.versions = map[0].get(GET_INFO_CBOR.VERSION);
        this.extenstions = map[0].get(GET_INFO_CBOR.EXTENSIONS);
        this.aaguid = map[0].get(GET_INFO_CBOR.AAGUID);
        this.options = map[0].get(GET_INFO_CBOR.OPTIONS);
        this.maxMsgSize = map[0].get(GET_INFO_CBOR.MAX_MSG_SIZE);
        this.pinProtocols = map[0].get(GET_INFO_CBOR.PIN_PROTOCOLS);
        this.maxCredsInList = map[0].get(GET_INFO_CBOR.MAX_CREDS_IN_LIST);
        this.maxCredLen = map[0].get(GET_INFO_CBOR.MAX_CRED_ID_LENGTH);
        this.transports = map[0].get(GET_INFO_CBOR.TRANSPORTS);
        this.algorithms = map[0].get(GET_INFO_CBOR.ALGORITHMS);
    }
}

class MakeCredential {

    /**
     *
     * @param clientDataHash
     * @param rp
     * @param user
     * @param keyParams
     * @param excludeList
     * @param extensions
     * @param options
     * @param pinAuth
     * @param pinProtocol
     */
    constructor(clientDataHash, rp, user, keyParams, excludeList, extensions, options, pinAuth, pinProtocol) {

        this.clientDataHash = clientDataHash;
        this.rp = rp;
        this.user = user;
        this.keyParams = keyParams;
        this.excludeList = excludeList;
        this.extensions = extensions;
        this.options = options;
        this.pinAuth = pinAuth;
        this.pinProtocol = pinProtocol;
    }

    toCBOR() {

        let data = new Map();

        data.set(1, this.clientDataHash);
        data.set(2, this.rp);
        data.set(3, this.user);
        if (this.keyParams.length) data.set(4, this.keyParams);
        if (this.excludeList.length) data.set(5, this.excludeList);
        if (this.extensions) data.set(6, this.extensions);
        if (this.options) data.set(7, this.options);
        if (this.pinAuth) data.set(8, this.pinAuth);
        if (this.pinProtocol) data.set(9, this.pinProtocol);

        return cbor.encode(data);
    }
}

class Attestation {

    /**
     *
     * @param cborEncode
     */
    constructor(cborEncode) {

        let map = cbor.decodeAllSync(cborEncode);
        this.authData = map[0].get(ATTESTATION_CBOR.AUTH_DATA);
        this.fmt = map[0].get(ATTESTATION_CBOR.FMT);
        this.attStmt = map[0].get(ATTESTATION_CBOR.ATT_STMT);
        this.aaa = 0;
    }

    /**
     *
     * @returns {Buffer}
     */
    getCredID = () => {

        let attestationCredData = this.authData.slice(37);
        let credLen = attestationCredData.readUInt16BE(16);
        return attestationCredData.slice(18, 18 + credLen);
    };

    /**
     *
     * @returns {Buffer}
     */
    getAAGUID = () => {
        return this.authData.slice(0, 16);
    };

    /**
     *
     * @returns {Buffer}
     */
    toCBOR = () => {

        let data = new Map();
        data.set('authData', this.authData);
        data.set('fmt', this.fmt);
        data.set('attStmt', this.attStmt);
        return cbor.encode(data);
    }
}

class Assertion {

    /**
     *
     * @param cborEncode
     */
    constructor(cborEncode) {

        let map = cbor.decodeAllSync(cborEncode);
        this.credential = map[0].get(ASSERTION_CBOR.CREDENTIAL);
        this.authData = map[0].get(ASSERTION_CBOR.AUTH_DATA);
        this.signature = map[0].get(ASSERTION_CBOR.SIGNATURE);
        this.user = map[0].get(ASSERTION_CBOR.USER);
        this.numberOfCredentials = map[0].get(ASSERTION_CBOR.N_CREDS);
    }
}

class GetAssertion {

    /**
     *
     * @param rp
     * @param clientDataHash
     * @param allowList {Array}
     * @param extensions
     * @param options
     * @param pinAuth
     * @param pinProtocol
     */
    constructor(rp, clientDataHash, allowList, extensions, options, pinAuth, pinProtocol) {

        this.rp = rp;
        this.clientDataHash = clientDataHash;
        this.allowList = allowList;
        this.extensions = extensions;
        this.options = options;
        this.pinAuth = pinAuth;
        this.pinProtocol = pinProtocol;
    }

    /**
     *
     * @returns {Buffer}
     */
    toCBOR = () => {

        let data = new Map();

        data.set(1, this.rp);
        data.set(2, this.clientDataHash);
        if (this.allowList.length) data.set(3, this.allowList);
        if (this.extensions) data.set(4, this.extensions);
        data.set(5, this.options);
        if (this.pinAuth) data.set(6, this.pinAuth);
        if (this.pinProtocol) data.set(7, this.pinProtocol);
        return cbor.encode(data);
    }
}

class ClientPinReq {

    /**
     *
     * @param pinProtocol
     * @param subCommand
     * @param keyAgreement
     * @param pinAuth
     * @param newPinEnc
     * @param pinHashEnc
     */
    constructor(pinProtocol, subCommand, keyAgreement, pinAuth, newPinEnc, pinHashEnc) {

        this.pinProtocol = pinProtocol;
        this.subCommand = subCommand;
        this.keyAgreement = keyAgreement;
        this.pinAuth = pinAuth;
        this.newPinEnc = newPinEnc;
        this.pinHashEnc = pinHashEnc;
    }

    /**
     *
     * @returns {Buffer}
     */
    toCBOR = () => {
        let data = new Map();
        data.set(1, this.pinProtocol);
        data.set(2, this.subCommand);
        if (this.keyAgreement) data.set(3, this.keyAgreement);
        if (this.pinAuth) data.set(4, this.pinAuth);
        if (this.newPinEnc) data.set(5, this.newPinEnc);
        if (this.pinHashEnc) data.set(6, this.pinHashEnc);
        return cbor.encode(data);
    }
}

class ClientPinResp {

    /**
     *
     * @param cborEncode
     */
    constructor(cborEncode) {

        let map = cbor.decodeAllSync(cborEncode);
        if (map.length !== 0) {
            this.keyAgreement = map[0].get(CLIENT_PIN_CBOR.KEY_AGREEMENT);
            this.pinUvAuthToken = map[0].get(CLIENT_PIN_CBOR.PIN_TOKEN);
            this.pinRetries = map[0].get(CLIENT_PIN_CBOR.RETRIES);
            this.powerCycleState = map[0].get(CLIENT_PIN_CBOR.POWER_CYCLE_STATE);
        }
    }
}

/**
 *
 * @type {InfoResp}
 */
module.exports.InfoResp = InfoResp;

/**
 *
 * @type {MakeCredential}
 */
module.exports.MakeCredential = MakeCredential;

/**
 *
 * @type {Attestation}
 */
module.exports.Attestation = Attestation;

/**
 *
 * @type {Assertion}
 */
module.exports.Assertion = Assertion;

/**
 *
 * @type {GetAssertion}
 */
module.exports.GetAssertion = GetAssertion;

/**
 *
 * @type {ClientPinReq}
 */
module.exports.ClientPinReq = ClientPinReq;

/**
 *
 * @type {ClientPinResp}
 */
module.exports.ClientPinResp = ClientPinResp;