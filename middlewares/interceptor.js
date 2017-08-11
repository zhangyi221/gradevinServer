/**
 * 拦截器中间件
 */

var tokenUtil = require('../utils/token')
var redis = require('../utils/redis')
var cookie_util = require('../utils/cookie')
var Auth = require('../models/auth')
var util = require('../utils/util')
var code = require('../config/error_code')

var cookieParser = require('cookie-parser');

var secretKey = require('../config/secret')

module.exports = function (req, res, next) {
    var token = tokenUtil.getToken(req)
    var secret = secretKey.token_secret_key
    var secrets = !secret || Array.isArray(secret)
        ? (secret || [])
        : [secret];
    var session_id = cookie_util.getcookie(req, 'jsessionid', secrets)
    if (session_id === undefined) {
        return res.api_error( { code: code.getErrorCode_name('auth_cookie_unsign'), msg: code.getErrorMessage_name('auth_cookie_unsign') })//cookie签名验证失败
    }
    //校验token有效期并返回_id
    redis.redisClient.get('tokenid:' + token, (err, replay) => {
        if (err) {
            return res.api_error( { code: 99999, msg: err.message })
        }
        if (replay) {
            //校验sessionid并检查赋值user信息
            var _id = replay
            redis.redisClient.get('sess:' + session_id, (err, replay) => {
                if (err) {
                    return res.api_error( { code: 99999, msg: err.message })
                }
                if (replay) {
                    var replay_obj = JSON.parse(replay)
                    //判断session中用户数据是否存在
                    if (!replay_obj.user) {
                        //不存在就赋值
                        Auth.findByIdAsync({ _id: _id }).then(doc => {
                            if (doc) {
                                util.setSessionUserInfo(req, doc)
                            } else {
                                return res.api_error( { code: code.getErrorCode_name('auth_session_noexist'), msg: code.getErrorMessage_name('auth_session_noexist') })//session已经失效或不存在
                            }
                            next()
                        }).catch(err => {
                            return res.api_error( { code: 99999, msg: err.message })
                        })
                    } else {
                        next()
                    }
                } else {
                    return res.api_error( { code: code.getErrorCode_name('auth_session_noexist'), msg: code.getErrorMessage_name('auth_session_noexist') })//session已经失效或不存在
                }
            })
        } else {
            return res.api_error( { code: code.getErrorCode_name('auth_token_noexist'), msg: code.getErrorMessage_name('auth_token_noexist') })//token已经失效或不存在
        }
    })
}