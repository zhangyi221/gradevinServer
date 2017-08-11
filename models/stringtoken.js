
/**
* 用户生成的stringtoken
* userid,用户id
* stringtoken,生成的字符串
* expire,过期时间
*/
var mongoose = require('mongoose');
var config = require('../config/' + process.env.NODE_ENV)
var StringTokenScheam = mongoose.Schema({
    stringtoken: {
        type: String,
        required: true,
        index : true
    },
    email: {
        type: String,
        required: true,
        index : true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: config.STRING_TOKEN_EXPIRATION//1小时1*60*60
    }
})

module.exports = mongoose.model("stringtoken", StringTokenScheam)