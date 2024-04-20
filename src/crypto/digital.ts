const ecdsa = {name: 'ECDSA'}
const ecdsaHashed = {...ecdsa, hash: 'SHA-512'}
const ecdsaGen = {...ecdsa, namedCurve: 'P-521'}
export const generateDigitalKey = () => crypto.subtle.generateKey(ecdsaGen, true, ['sign', 'verify'])
    .then(({privateKey, publicKey}) => ({signKey: privateKey, verifyKey: publicKey}))
export const exportSignKey = (signKey: CryptoKey) => crypto.subtle.exportKey('pkcs8', signKey)
export const importSignKey = (signKeyData: BufferSource) => crypto.subtle.importKey('pkcs8', signKeyData, ecdsaGen, false, ['sign'])
export const exportVerifyKey = (verifyKey: CryptoKey) => crypto.subtle.exportKey('spki', verifyKey)
export const importVerifyKey = (verifyKeyData: BufferSource) => crypto.subtle.importKey('spki', verifyKeyData, ecdsaGen, false, ['verify'])
export const sign = (signKey: CryptoKey, data: BufferSource) => crypto.subtle.sign(ecdsaHashed, signKey, data)
export const verify = (verifyKey: CryptoKey, data: BufferSource, signature: BufferSource) => crypto.subtle.verify(ecdsaHashed, verifyKey, signature, data)