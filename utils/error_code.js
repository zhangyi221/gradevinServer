/**
 * API 错误码
 */
var ErrorCode = require('../models/errorcode');
var errorinfo = [];
exports.Init = async function () {
    this.errorinfo = await ErrorCode.find({ "errorfrom": 'server' }, { _id: 0 });
    console.log('错误码初始化成功')
}

exports.errorinfo

/**
 * 获取错误信息
 * @param code 错误码
*/
exports.getErrorMessage_code = function (code) {
    for (var value in this.errorinfo) {
        if (code == this.errorinfo[value].code) {
            return this.errorinfo[value].message_trans;
        }
    }
    return '';
}
/**
 * 获取错误码
 * @param errorname 错误名
*/
exports.getErrorCode_name = function (errorname) {
    for (var value in this.errorinfo) {
        if (errorname == this.errorinfo[value].errorname) {
            return this.errorinfo[value].code;
        }
    }
    return '';
}
/**
 * 获取错误信息
 * @param errorname 错误名
*/
exports.getErrorMessage_name = function (errorname) {
    for (var value in this.errorinfo) {
        if (errorname == this.errorinfo[value].errorname) {
            return this.errorinfo[value].message_trans;
        }
    }
    return '';
}