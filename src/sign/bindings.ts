import bindings from 'bindings';

interface IVerifyResult {
    verified: boolean;
    signer: string;
}

const binding = bindings('sign.node');

export function verify(filepath: string): IVerifyResult {
    return binding.verify(filepath);
}