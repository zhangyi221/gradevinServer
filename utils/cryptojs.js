var CryptoJS = require('crypto-js')
var md5_secret_key = require('../config/secret').md5_secret_key
var ase_secret_key = require('../config/secret').ase_secret_key

module.exports.md5 = function (value) {
    return CryptoJS.MD5(value, md5_secret_key).toString()
}

module.exports.AES_Encrypt = function (value) {
    if (!value) return ''
    // Encrypt
    let ciphertext = CryptoJS.AES.encrypt(value, ase_secret_key).toString();
    return ciphertext
}

module.exports.AES_Decrypt = function (value) {
    if (!value) return ''
    // Decrypt
    let bytes = CryptoJS.AES.decrypt(value.toString(), ase_secret_key);
    let plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext
}