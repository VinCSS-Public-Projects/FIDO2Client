export enum Fido2SpecVersion {
    v20 = 'FIDO_2_0',
    v21p = 'FIDO_2_1_PRE',
    v21 = 'FIDO_2_1'
}

export enum ClientPinVersion {
    v1 = 1,
    v2 = 2
}

export const Fido2Spec: Fido2SpecVersion = Fido2SpecVersion.v21;
export const ClientPin: ClientPinVersion[] = [ClientPinVersion.v1];