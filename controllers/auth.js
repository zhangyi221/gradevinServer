/**
 * 认证逻辑控制器
 */
var randToken = require('rand-url-token')
var tokenUtil = require('../utils/token')
var code = require('../config/error_code')
var config = require('../config/' + process.env.NODE_ENV)
var email_config = require('../config/email')
var sendEmail = require('../utils/email')
var util = require('../utils/util')
var redis = require('../utils/redis')
var utils_ctrl = require('../controllers/utils')
var Auth = require('../models/auth')
var StringToken = require('../models/stringtoken')
var push = require('../utils/socketio-push')
var _ = require('lodash')

/**
 * 使用用户邮箱和密码登录
	 */
exports.signInWithEmailAndPassword = function (req, res) {
	let email = req.body.email
	let password = req.body.password
	let captcha_ = req.body.captcha//上传captcha
	let captcha = req.session.captcha//服务端captcha
	//邮箱地址或密码不能为空
	if (!email || !password) return res.api_error({ code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_null') })
	//验证码验证,以后添加
	if (!_.isEqual(_.toUpper(captcha_), _.toUpper(captcha))) {
		//请正确输入验证码
		return res.api_error({ code: code.getErrorCode_name('auth_captcha_err'), msg: code.getErrorMessage_name('auth_captcha_err') })
	}

	Auth.getAuthenticated(email, password).then(doc => {
		if (doc == 0) {
			return res.api_error({ code: code.getErrorCode_name('auth_user_noexist'), msg: code.getErrorMessage_name('auth_user_noexist') })//用户不存在或邮箱地址不正确
		}
		if (doc == 1) {
			return res.api_error({ code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_error') })//邮箱或密码错误
		}
		if (doc == 2) {
			return res.api_error({ code: code.getErrorCode_name('auth_name_islucked'), msg: code.getErrorMessage_name('auth_name_islucked') })//账号已被锁定，请稍后重新尝试
		}
		if (doc == 3) {
			return res.api_error({ code: code.getErrorCode_name('auth_email_activate_not'), msg: code.getErrorMessage_name('auth_email_activate_not') })//用户尚未邮件激活，请激活后重新尝试
		}
		let token = tokenUtil.generateToken(doc._id)
		redis.redisClient.set('tokenid:' + token, doc._id.toString())
		redis.redisClient.expire('tokenid:' + token, config.TOKEN_EXPIRATION)
		util.setSessionUserInfo(req, doc)
		// res.cookie('token', token)
		return res.api({ token: token, user: doc }, { code: 0, msg: '交易成功' })
	}).catch(err => {
		return res.api_error({ code: 99999, msg: err.message })
	})
}
/**
 * 使用手机号码快速登录
	 */
exports.signInWithPhone = async function (req, res) {
	let phone = req.body.phone//手机号
	let verification = req.body.verification//验证码
	//判断输入参数
	if (!phone) return res.api_error({ code: code.getErrorCode_name('auth_phone_null'), msg: code.getErrorMessage_name('auth_phone_null') })
	if (!verification) return res.api_error({ code: code.getErrorCode_name('auth_verification_null'), msg: code.getErrorMessage_name('auth_verification_null') })
	//校验短信验证码
	let isvalid = await utils_ctrl.smsValid_boolean(req)
	if (!isvalid) return res.api_error({ code: code.getErrorCode_name('auth_verification_err'), msg: code.getErrorMessage_name('auth_verification_err') })
	Auth.findOneAsync({ phone: phone },'-password -__v').then(doc => {
		if (doc) {
			//存在
			let token = tokenUtil.generateToken(doc._id)
			redis.redisClient.set('tokenid:' + token, doc._id.toString())
			redis.redisClient.expire('tokenid:' + token, config.TOKEN_EXPIRATION)
			util.setSessionUserInfo(req, doc)
			return res.api({ token: token, user: doc }, { code: 0, msg: '交易成功' })
		} else {
			return res.api_error({ code: code.getErrorCode_name('auth_phone_noexist'), msg: code.getErrorMessage_name('auth_phone_noexist') })
		}
	}).catch(err => {
		return res.api_error({ code: 99999, msg: err.message })
	})
}
/**
 * 使用手机号码查询是否注册
 * */
exports.createUserIsUsedByPhone = function (req, res) {
	let phone = req.query.phone//手机号
	//判断输入参数
	if (!phone) return res.api_error({ code: code.getErrorCode_name('auth_phone_null'), msg: code.getErrorMessage_name('auth_phone_null') })
	Auth.findOneAsync({ phone: phone }).then(doc => {
		if (doc) {
			//该手机号已经注册或绑定
			return res.api_error({ code: code.getErrorCode_name('auth_phone_exist'), msg: code.getErrorMessage_name('auth_phone_exist') })
		} else {
			return res.api({ is_userd: false }, { code: 0, msg: '交易成功' })
		}
	}).catch(err => {
		return res.api_error({ code: 99999, msg: err.message })
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
			push.pushMsgToSingleDevice(req.session.user._id.toString(), 'user', '')
			let token = tokenUtil.getToken(req)
			redis.redisClient.del('tokenid:' + token, function (err, reply) {
				console.log('删除redis中token数据[' + reply + ']：');// 删除成功，返回1，否则返回0(对于不存在的键进行删除操作，同样返回0) 
			});


			req.session.destroy()
			delete req.user
			return res.api(null, { code: 0, msg: '退出成功' })
		} else {
			return res.api_error({ code: -1, msg: '退出失败' })
		}
	} catch (err) {
		return res.api_error({ code: 99999, msg: err.message })
	}

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
	let email = req.body.email
	let password = req.body.password
	let displayName = req.body.displayName
	//邮箱地址或密码不能为空
	if (!email || !password) return res.api_error({ code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_null') })
	//验证码验证,以后添加
	if (!_.isEqual(_.toUpper(req.body.captcha), _.toUpper(req.session.captcha))) {
		//请正确输入验证码
		return res.api_error({ code: code.getErrorCode_name('auth_captcha_err'), msg: code.getErrorMessage_name('auth_captcha_err') })
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
					password: password,
					isActivate: true,
					activate: '1'
				}).save().then(() => {
					//2、生成stringtoken
					generateStringToken(email).then(stringtoken => {
						//3、发送激活邮件
						let message = util.clone(email_config.sign_message)
						message.to = email
						message.html = message.html.replaceAll('${a}', stringtoken)
						sendEmail(message)
						return res.api(null, { code: 0, msg: '注册成功，激活链接已经发送到您的邮箱' })
					})
				}).catch(err => {
					return res.api_error({ code: 99999, msg: err.message })
				})

			} else {
				//不需要激活
				new Auth({
					displayName: displayName,
					email: email,
					password: password,
				}).save();
				return res.api(null, { code: 0, msg: '注册成功' })
			}
		} else {
			//用户名已存在
			return res.api_error({ code: code.getErrorCode_name('auth_name_exist'), msg: code.getErrorMessage_name('auth_name_exist') })
		}
	}).catch(err => {
		return res.api_error({ code: 99999, msg: err.message })
	})
}

/**
 * 通过邮箱重置密码
 * @param email
 */
exports.sendPasswordResetEmail = function (req, res) {
	let email = req.body.email
	if (!email) return res.api_error({ code: code.getErrorCode_name('auth_email_null'), msg: code.getErrorMessage_name('auth_email_null') })//邮箱地址不能为空

	Auth.findOneAsync({ email: email }).then(doc => {
		if (doc) {
			//2、生成stringtoken
			generateStringToken(email).then(stringtoken => {
				//3、发送激活邮件
				let message = util.clone(email_config.resetpass_message)
				message.to = email
				message.html = message.html.replaceAll('${a}', stringtoken)
				sendEmail(message)
				return res.api(null, { code: 0, msg: '发送成功，重置密码链接已经发送到您的邮箱' })
			})
		} else {
			//用户名已存在
			return res.api_error({ code: code.getErrorCode_name('auth_user_noexist'), msg: code.getErrorMessage_name('auth_user_noexist') })//用户不存在或邮箱地址不正确
		}
	}).catch(err => {
		return res.api_error({ code: 99999, msg: err.message })
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
	let email = req.body.email
	let type = req.body.type
	//邮箱地址不能为空
	if (!email) return res.api_error({ code: code.getErrorCode_name('auth_email_null'), msg: code.getErrorMessage_name('auth_email_null') })
	//生成stringtoken
	generateStringToken(email).then(stringtoken => {
		//3、发送激活邮件
		let message = ''
		if (type == 'sign') message = util.clone(email_config.sign_message)
		if (type == 'resetpass') message = util.clone(email_config.resetpass_message)
		message.to = email
		message.html = message.html.replaceAll('${a}', stringtoken)
		sendEmail(message)
		return res.api(null, { code: 0, msg: '激活链接已经重新发送到您的邮箱' })
	}).catch(err => {
		return res.api_error({ code: 99999, msg: err.message })
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
					let newstringtoken = new StringToken(save)
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
	let oldToken = tokenUtil.getToken(req)
	if (oldToken && tokenUtil.verifyToken(oldToken)) {
		let newTokent = tokenUtil.refreshToken(oldToken)
		redis.redisClient.set('tokenid:' + token, req.user._id)
		redis.redisClient.expire('tokenid:' + token, config.TOKEN_EXPIRATION_SEC)
	}
	return res.api(newTokent, { code: 0, msg: 'ok' })
}

exports.test = function (req, res) {
	return res.api_error({ code: 0, msg: 'ok' })
}

