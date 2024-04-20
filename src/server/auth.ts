import {importVerifyKey, verify} from "@/crypto/digital";

class AuthError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'AuthError'
    }
}

export default async (keyVerify: Buffer, arrayBuffer: ArrayBuffer, au: Buffer) => {
    if (!await verify(await importVerifyKey(keyVerify), arrayBuffer, au)) throw new AuthError('The signature is forged.')
}