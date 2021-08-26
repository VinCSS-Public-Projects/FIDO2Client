export enum Fido2SpecVersion {
    UNKNOWN = -1,
    FIDO_2_0,
    FIDO_2_1_PRE,
    FIDO_2_1
}

/**
 * Return latest version.
 * @param versions 
 */
export function getLatestSpecVersion(versions: string[]): Fido2SpecVersion {
    let temp = Object.keys(Fido2SpecVersion).reverse();
    return temp.indexOf(temp.find(x => versions.includes(x)) || 'UNKNOWN');
}

export enum ClientPinVersion {
    v1 = 1,
    v2 = 2
}

export const Fido2Spec: Fido2SpecVersion = Fido2SpecVersion.FIDO_2_1;
export const ClientPin: ClientPinVersion[] = [ClientPinVersion.v1];