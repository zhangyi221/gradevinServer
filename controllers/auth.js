/**
 * 认证逻辑控制器
 */
var randToken = require('rand-url-token')
var tokenUtil = require('../utils/token')
var code = require('../config/error_code')
var md5 = require('../utils/md5')
var config = require('../config/' + process.env.NODE_ENV)
var email_config = require('../config/email')
var sendEmail = require('../utils/email')
var util = require('../utils/util')
var redis = require('../utils/redis')
var _ = require('lodash')

var Auth = require('../models/auth')
var StringToken = require('../models/stringtoken')
var push = require('../utils/socketio-push')
/**
 * 使用用户邮箱和密码登录
	 */
exports.signInWithEmailAndPassword = function (req, res) {
	var email = req.body.email
	var password = req.body.password
	//邮箱地址或密码不能为空
	if (!email || !password) return res.api_error( { code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_null') })
	//验证码验证,以后添加
	if (!_.isEqual(_.toUpper(req.body.captcha), _.toUpper(req.session.captcha))) {
		//请正确输入验证码
		return res.api_error( { code: code.getErrorCode_name('auth_captcha_err'), msg: code.getErrorMessage_name('auth_captcha_err') })
	}

	Auth.getAuthenticated(email, password).then(doc => {
		if (doc == 0) {
			return res.api_error( { code: code.getErrorCode_name('auth_user_noexist'), msg: code.getErrorMessage_name('auth_user_noexist') })//用户不存在或邮箱地址不正确
		}
		if (doc == 1) {
			return res.api_error( { code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_error') })//邮箱或密码错误
		}
		if (doc == 2) {
			return res.api_error( { code: code.getErrorCode_name('auth_name_islucked'), msg: code.getErrorMessage_name('auth_name_islucked') })//账号已被锁定，请稍后重新尝试
		}
		if (doc == 3) {
			return res.api_error( { code: code.getErrorCode_name('auth_email_activate_not'), msg: code.getErrorMessage_name('auth_email_activate_not') })//用户尚未邮件激活，请激活后重新尝试
		}
		var token = tokenUtil.generateToken(doc._id)
		redis.redisClient.set('tokenid:'+token,doc._id.toString())
		redis.redisClient.expire('tokenid:'+token, config.TOKEN_EXPIRATION)
		util.setSessionUserInfo(req,doc)
		// res.cookie('token', token)
		return res.api({ token: token, user: doc }, { code: 0, msg: '交易成功' })
	}).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}

/**
 * 用户退出
 */
exports.signOut = function (req, res) {
	try {
		if (req.user) {
			let userid = req.session.user._id
			//当前采用订阅模式获取的客户端io,无法删除客户端句柄和主动断开
			//向客户端发送空对象由客户端主动断开
			push.pushMsgToSingleDevice(req.session.user._id.toString(),'user','')
			let token = tokenUtil.getToken(req)
			redis.redisClient.del('tokenid:'+token, function (err, reply) { 
				console.log('删除redis中token数据['+reply+']：');// 删除成功，返回1，否则返回0(对于不存在的键进行删除操作，同样返回0) 
			}); 


			req.session.destroy()
			delete req.user
			return res.api(null, { code: 0, msg: '退出成功' })
		} else {
			return res.api_error( { code: -1, msg: '退出失败' })
		}
	} catch (err) {
		return res.api_error( { code: 99999, msg: err.message })
	}

}

/**
	 * 创建超级管理员
	 */
exports.initSuperAdmin = function (req, res) {
	const username = config.superAdmin.username
	const password = config.superAdmin.password

	Auth.findByName(username)
		.then(doc => {
			if (!doc) return this.model.newAndSave({
				username: username,
				password: md5(password),
			})
		}).catch(err => {
			return res.api_error( { code: 99999, msg: err.message })
		})
}
/**
 * @apiDescription 用户注册
 * @apiParam {String} email 用户名
 * @apiParam {String} password 密码
 * @aipParam {string} displayName 姓名
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "meta": {
 *       	"code": 0,
 *       	"message": "注册成功"
 *       },
 *       "data": null
 *     }
 */
exports.createUserWithEmailAndPassword = function (req, res) {
	var email = req.body.email
	var password = req.body.password
	var displayName = req.body.displayName
	//邮箱地址或密码不能为空
	if (!email || !password) return res.api_error( { code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_null') })
	//验证码验证,以后添加
	if (!_.isEqual(_.toUpper(req.body.captcha), _.toUpper(req.session.captcha))) {
		//请正确输入验证码
		return res.api_error( { code: code.getErrorCode_name('auth_captcha_err'), msg: code.getErrorMessage_name('auth_captcha_err') })
	}
	Auth.findOneAsync({ email: email }).then(doc => {
		if (!doc) {
			//判断是否需要发送激活邮件
			if (config.AUTH_EMAIL_ACTIVE) {
				//需要激活
				//1、创建用户
				new Auth({
					displayName: displayName,
					email: email,
					password: md5(password),
					isActivate: true,
					activate: '1'
				}).save().then(() => {
					//2、生成stringtoken
					generateStringToken(email).then(stringtoken => {
						//3、发送激活邮件
						var message = util.clone(email_config.sign_message)
						message.to = email
						message.html = message.html.replaceAll('${a}', stringtoken)
						sendEmail(message)
						return res.api(null, { code: 0, msg: '注册成功，激活链接已经发送到您的邮箱' })
					})
				}).catch(err => {
					return res.api_error( { code: 99999, msg: err.message }) 
				})

			} else {
				//不需要激活
				new Auth({
					displayName: displayName,
					email: email,
					password: md5(password)
				}).save();
				return res.api(null,  { code: 0, msg: '注册成功' })
			}
		} else {
			//用户名已存在
			return res.api_error( { code: code.getErrorCode_name('auth_name_exist'), msg: code.getErrorMessage_name('auth_name_exist') })
		}
	}).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}

/**
 * 通过邮箱重置密码
 * @param email
 */
exports.sendPasswordResetEmail = function (req, res) {
	var email = req.body.email
	if (!email) return res.api_error( { code: code.getErrorCode_name('auth_email_null'), msg: code.getErrorMessage_name('auth_email_null') })//邮箱地址不能为空

	Auth.findOneAsync({ email: email }).then(doc => {
		if (doc) {
			//2、生成stringtoken
			generateStringToken(email).then(stringtoken => {
				//3、发送激活邮件
				var message = util.clone(email_config.resetpass_message)
				message.to = email
				message.html = message.html.replaceAll('${a}', stringtoken)
				sendEmail(message)
				return res.api(null,  { code: 0, msg: '发送成功，重置密码链接已经发送到您的邮箱' })
			})
		} else {
			//用户名已存在
			return res.api_error( { code: code.getErrorCode_name('auth_user_noexist'), msg: code.getErrorMessage_name('auth_user_noexist') })//用户不存在或邮箱地址不正确
		}
	}).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}
/**
 * @apiDescription 重新发送邮件
 * @apiParam {String} email 用户名
 * @apiParam {String} type 发送什么类型的邮件 sign/resetpass
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "meta": {
 *       	"code": 0,
 *       	"message": "发送成功"
 *       },
 *       "data": null
 *     }
 */
exports.resendStringTokenByEmail = function (req, res) {
	var email = req.body.email
	var type = req.body.type
	//邮箱地址不能为空
	if (!email) return res.api_error( { code: code.getErrorCode_name('auth_email_null'), msg: code.getErrorMessage_name('auth_email_null') })
	//生成stringtoken
	generateStringToken(email).then(stringtoken => {
		//3、发送激活邮件
		var message = ''
		if (type == 'sign') message = util.clone(email_config.sign_message)
		if (type == 'resetpass') message = util.clone(email_config.resetpass_message)
		message.to = email
		message.html = message.html.replaceAll('${a}', stringtoken)
		sendEmail(message)
		return res.api(null, { code: 0, msg: '激活链接已经重新发送到您的邮箱' })
	}).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}
/**
 * 生成stringToken
 * @param {邮箱地址} email 
 * @return {stringtoken} 
 */
function generateStringToken(email) {
	return new Promise(function (resolve, reject) {
		//先查
		StringToken.findOneAsync({ email: email })
			.then(doc => {
				if (!doc) {
					//不存在
					const save = {
						stringtoken: randToken(20),
						email: email
					}
					var newstringtoken = new StringToken(save)
					newstringtoken.save().then(() => {
						resolve(save.stringtoken)
					})

				} else {
					//存在
					const updates = {
						$set: {
							stringtoken: randToken(20),
							createdAt: Date.now()
						}
					}
					const find = {
						email: email
					}
					StringToken.findOneAndUpdateAsync(find, updates).then(() => {
						resolve(updates.$set.stringtoken) 
					})
				}
			}).catch(err => {
				reject(err);
			})
	})
}

exports.refreshToken = function (req, res) {
	var oldToken = tokenUtil.getToken(req)
    if (oldToken && tokenUtil.verifyToken(oldToken)) {
		var newTokent = tokenUtil.refreshToken(oldToken)
        redis.redisClient.set('tokenid:'+token,req.user._id)
		redis.redisClient.expire('tokenid:'+token, config.TOKEN_EXPIRATION_SEC)
    }
	return res.api(newTokent, { code: 0, msg: 'ok' })
}

exports.test = function (req, res) {
	return res.api_error( { code: 0, msg: 'ok' })
}

