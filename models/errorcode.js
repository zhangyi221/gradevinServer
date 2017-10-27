/**
 * 服务端错误码表
 *  "errorfrom" : 错误码系统 
    "errorname" : 错误名称
    "code" : 错误代码 
    "enmessage_from" : 英文
    "cnmessage_from" : 中文 
    "message_trans" : 错误转义
 */
var mongoose = require('mongoose');

var ErrorCode = mongoose.Schema({
    errorfrom: {
        type: String,
        required: true
    },
    errorname: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    enmessage_from: String,
    cnmessage_from: String,
    message_trans: String
})
ErrorCode.set('collection', 'errorcode');
module.exports = mongoose.model("errorcode",ErrorCode)