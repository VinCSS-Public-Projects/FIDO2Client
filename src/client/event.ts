export const Fido2EventSuccess = 'fido2-event-success';
export const Fido2EventError = 'fido2-event-error';
export const Fido2EventDeviceSelected = 'fido2-event-device-selected';
export const Fido2EventDeviceAttach = 'fido2-event-device-attach';
export const Fido2EventSelectDevice = 'fido2-event-select-device';
export const Fido2EventKeepAlive = 'fido2-event-keep-alive';
export const Fido2EventCancel = 'fido2-event-cancel';
export const Fido2EventPinAvailable = 'fido2-event-pin-available';
export const Fido2EventPinValid = 'fido2-event-pin-valid';
export const Fido2EventPinInvalid = 'fido2-event-pin-invalid';
export const Fido2EventPinAuthBlocked = 'fido2-event-pin-auth-blocked';
export const Fido2EventPinBlocked = 'fido2-event-pin-blocked';
export const Fido2EventEnterPin = 'fido2-event-enter-pin';
export const Fido2EventSetPin = 'fido2-event-set-pin';
export const Fido2EventTimeout = 'fido2-event-timeout';
export const Fido2EventRequest = 'fido2-event-request';
export const Fido2EventResponse = 'fido2-event-response';
export const Fido2EventNoCredentials = 'fido2-event-no-credentials';

export type Fido2Event =
    | typeof Fido2EventSuccess
    | typeof Fido2EventError
    | typeof Fido2EventDeviceSelected
    | typeof Fido2EventDeviceAttach
    | typeof Fido2EventSelectDevice
    | typeof Fido2EventKeepAlive
    | typeof Fido2EventCancel
    | typeof Fido2EventPinAvailable
    | typeof Fido2EventPinValid
    | typeof Fido2EventPinInvalid
    | typeof Fido2EventPinAuthBlocked
    | typeof Fido2EventPinBlocked
    | typeof Fido2EventEnterPin
    | typeof Fido2EventSetPin
    | typeof Fido2EventTimeout
    | typeof Fido2EventRequest
    | typeof Fido2EventResponse
    | typeof Fido2EventNoCredentials
    ;