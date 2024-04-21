import {aes} from "@/crypto/symmetric";

const rsa = {name: 'RSA-OAEP'}
const rsaHashed = {...rsa, hash: 'SHA-512'}
const rsaGen = {...rsaHashed, modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1])}
export const generateAsymmetricKey = () => crypto.subtle.generateKey(rsaGen, true, ['wrapKey', 'unwrapKey'])
    .then(({privateKey, publicKey}) => ({wrapKey: publicKey, unwrapKey: privateKey}))
export const exportWrapKey = (wrapKey: CryptoKey) => crypto.subtle.exportKey('spki', wrapKey)
export const importWrapKey = (wrapKeyData: BufferSource) => crypto.subtle.importKey('spki', wrapKeyData, rsaHashed, false, ['wrapKey'])
export const exportUnwrapKey = (unwrapKey: CryptoKey) => crypto.subtle.exportKey('pkcs8', unwrapKey)
export const importUnwrapKey = (unwrapKeyData: BufferSource) => crypto.subtle.importKey('pkcs8', unwrapKeyData, rsaHashed, false, ['unwrapKey'])
export const wrap = (key: CryptoKey, wrapKey: CryptoKey) => crypto.subtle.wrapKey('raw', key, wrapKey, rsa)
export const unwrap = (wrappedKeyData: BufferSource, unwrapKey: CryptoKey) => crypto.subtle.unwrapKey('raw', wrappedKeyData, unwrapKey, rsa, aes, false, ['encrypt', 'decrypt'])