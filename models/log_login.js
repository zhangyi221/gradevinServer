/**
 * 登录日志
 * user_id,用户ID
 * phone,手机号
 * email,邮箱
 * type,登录类型
 * date,登录时间
 * islogin,是否登录成功
 * errcode,错误代码
 * errmessage,失败信息
 */
var mongoose = require('mongoose');

var LogLoginSchema = mongoose.Schema({
    user_id: {
        type: String,
        index: true
    },
    phone: {
        type: String,
        index: true
    },
    email: {
        type: String,
        index: true
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    islogin: {
        type: Boolean,
        required: true
    },
    errmessage: String
})

LogLoginSchema.set('autoIndex', false);

module.exports = mongoose.model("log_login",LogLoginSchema)