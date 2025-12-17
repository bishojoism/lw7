export const aes = {name: 'AES-GCM'}
const aesGen = {...aes, length: 256}
export const generateSymmetricKey = () => crypto.subtle.generateKey(aesGen, true, ['encrypt', 'decrypt'])
export const exportKey = (key: CryptoKey) => crypto.subtle.exportKey('raw', key)
export const importKey = (keyData: BufferSource) => crypto.subtle.importKey('raw', keyData, aesGen, false, ['encrypt', 'decrypt'])
export const encrypt = async (key: CryptoKey, data: BufferSource) => {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    return [iv, await crypto.subtle.encrypt({...aes, iv}, key, data)]
}
export const decrypt = async (key: CryptoKey, encrypted: [BufferSource, BufferSource]) => {
    const [iv, data] = encrypted
    return await crypto.subtle.decrypt({...aes, iv}, key, data)
}