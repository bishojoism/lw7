import {importVerifyKey, verify} from "@/crypto/digital";

class AuthError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'AuthError'
    }
}

export default async (keyVerify: Buffer, arrayBuffer: ArrayBuffer, au: Buffer) => {
    if (!await verify(await importVerifyKey(keyVerify.buffer.slice() as ArrayBuffer), arrayBuffer, au.buffer.slice() as ArrayBuffer)) throw new AuthError('The signature is forged.')
}