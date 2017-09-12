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
var log_login = require('../models/log_login')
var push = require('../utils/socketio-push')
var _ = require('lodash')

/**
 * 使用用户邮箱和密码登录
	 */
exports.signInWithEmailAndPassword = async function (req, res) {
	let email = req.body.email
	let password = req.body.password
	let captcha_ = req.body.captcha//上传captcha
	let captcha = req.session.captcha//服务端captcha
	console.log('email='+email + '|password='+password + '|captcha_=' +captcha_)
	try {
		//邮箱地址或密码不能为空
		if (!email || !password) throw { code: code.getErrorCode_name('auth_emailpass_null'), message: code.getErrorMessage_name('auth_emailpass_null') }
		//return res.api_error({ code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_null') })

		//验证码验证,以后添加
		if (!_.isEqual(_.toUpper(captcha_), _.toUpper(captcha))) {
			//请正确输入验证码
			throw { code: code.getErrorCode_name('auth_captcha_err'), msg: code.getErrorMessage_name('auth_captcha_err') }
		}
		console.log('准备查询')
		let doc = await Auth.getAuthenticated(email, password)
		console.log('查询完成',doc)
		if (doc == 0) {
			throw { code: code.getErrorCode_name('auth_user_noexist'), msg: code.getErrorMessage_name('auth_user_noexist') }//用户不存在或邮箱地址不正确
		}
		if (doc == 1) {
			throw { code: code.getErrorCode_name('auth_emailpass_null'), msg: code.getErrorMessage_name('auth_emailpass_error') }//邮箱或密码错误
		}
		if (doc == 2) {
			throw { code: code.getErrorCode_name('auth_name_islucked'), msg: code.getErrorMessage_name('auth_name_islucked') }//账号已被锁定，请稍后重新尝试
		}
		if (doc == 3) {
			throw { code: code.getErrorCode_name('auth_email_activate_not'), msg: code.getErrorMessage_name('auth_email_activate_not') }//用户尚未邮件激活，请激活后重新尝试
		}
		let token = tokenUtil.generateToken(doc._id)
		redis.redisClient.set('tokenid:' + token, doc._id.toString())
		redis.redisClient.expire('tokenid:' + token, config.TOKEN_EXPIRATION)
		util.setSessionUserInfo(req, doc)
		// res.cookie('token', token)
		console.log('开始记录日志')
		//记录登录日志
		new log_login({
			user_id: doc._id,
			email: email,
			password: password,
			type: 'email',
			islogin: true,
		}).save()
		return res.api({ token: token, user: doc }, { code: 0, msg: '交易成功' })
	} catch (err) {
		console.log('发生异常',err)
		//记录登录日志
		let code = (!err.code) ? 99999 : err.code
		new log_login({
			email: email,
			password: password,
			type: 'email',
			islogin: false,
			errcode: code,
			errmessage: err.message
		}).save()
		
		return res.api_error({ code: code, msg: err.message })
	}
}
/**
 * 使用手机号码快速登录
	 */
exports.signInWithPhone = async function (req, res) {
	try {
		let phone = req.body.phone//手机号
		let verification = req.body.verification//验证码
		//判断输入参数
		if (!phone) throw { code: code.getErrorCode_name('auth_phone_null'), msg: code.getErrorMessage_name('auth_phone_null') }
		if (!verification) throw { code: code.getErrorCode_name('auth_verification_null'), msg: code.getErrorMessage_name('auth_verification_null') }
		//校验短信验证码
		let isvalid = await utils_ctrl.smsValid_boolean(req)
		if (!isvalid) throw { code: code.getErrorCode_name('auth_verification_err'), msg: code.getErrorMessage_name('auth_verification_err') }
		let doc = await Auth.findOneAsync({ phone: phone }, '-password -__v')
		if (doc) {
			//存在
			let token = tokenUtil.generateToken(doc._id)
			redis.redisClient.set('tokenid:' + token, doc._id.toString())
			redis.redisClient.expire('tokenid:' + token, config.TOKEN_EXPIRATION)
			util.setSessionUserInfo(req, doc)

			//记录登录日志
			new log_login({
				user_id: doc._id,
				phone: phone,
				type: 'phone',
				islogin: true,
			}).save()

			return res.api({ token: token, user: doc }, { code: 0, msg: '交易成功' })
		} else {
			return res.api_error({ code: code.getErrorCode_name('auth_phone_noexist'), msg: code.getErrorMessage_name('auth_phone_noexist') })
		}

	} catch (err) {
		//记录登录日志
		let code = (!err.code) ? 99999 : err.code
		new log_login({
			email: email,
			password: password,
			type: 'email',
			islogin: false,
			errcode: code,
			errmessage: err.message
		}).save()
		
		return res.api_error({ code: code, msg: err.message })
	}
}
/**
 * 使用手机号码查询是否注册
 * */
exports.createUserIsUsedByPhone = async function (req, res) {
	try {
		let phone = req.query.phone//手机号
		//判断输入参数
		if (!phone) return res.api_error({ code: code.getErrorCode_name('auth_phone_null'), msg: code.getErrorMessage_name('auth_phone_null') })
		let doc = await Auth.findOneAsync({ phone: phone })
		if (doc) {
			//该手机号已经注册或绑定
			return res.api_error({ code: code.getErrorCode_name('auth_phone_exist'), msg: code.getErrorMessage_name('auth_phone_exist') })
		} else {
			return res.api({ is_userd: false }, { code: 0, msg: '交易成功' })
		}
	} catch (err) {
		return res.api_error({ code: 99999, msg: err.message })
	}
}
/**
 * 邮箱是否注册
 * */
exports.createUserIsUsedByEmail = async function (req, res) {
	try {
		let email = req.query.email//手机号
		//判断输入参数
		if (!email) return res.api_error({ code: code.getErrorCode_name('auth_email_null'), msg: code.getErrorMessage_name('auth_email_null') })
		let doc = await Auth.findOneAsync({ email: email })
		if (doc) {
			//该邮箱地址已经注册或绑定
			return res.api_error({ code: code.getErrorCode_name('auth_email_exist'), msg: code.getErrorMessage_name('auth_email_exist') })
		} else {
			return res.api({ is_userd: false }, { code: 0, msg: '交易成功' })
		}
	} catch (err) {
		return res.api_error({ code: 99999, msg: err.message })
	}
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
 * @description 使用邮箱密码注册用户
 * @param email 用户名
 * @param password 密码
 * @param displayName 姓名
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
					isPassword: true,
					isActivate: true,
					activate: '1',
					signupType: 'email'
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
					isPassword: true,
					signupType: 'email'
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
 * @description 使用手机注册
 * @param phone
 * @param email 
 * @param password ASE过的
 * @param displayName
 */
exports.createUserWithPhone = function (req, res) {
	let phone = req.body.phone
	let email = req.body.email
	let password = req.body.password
	let displayName = req.body.displayName
	//校验输入参数
	if (!phone) return res.api_error({ code: code.getErrorCode_name('auth_phone_null'), msg: code.getErrorMessage_name('auth_phone_null') })//手机号不能为空
	if (!email) return res.api_error({ code: code.getErrorCode_name('auth_email_null'), msg: code.getErrorMessage_name('auth_email_null') })//邮箱地址不能为空
	if (!password) return res.api_error({ code: code.getErrorCode_name('auth_pass_null'), msg: code.getErrorMessage_name('auth_pass_null') })//密码不能为空
	//自动生成
	if (!displayName) {
		displayName = randToken(8) + '(' + email + ')'
	}

	new Auth({
		phone: phone,
		displayName: displayName,
		email: email,
		password: password,
		isPassword: true,
		signupType: 'phone'
	}).save().then(doc => {
		console.log(doc)
		return res.api(doc, { code: 0, msg: '注册成功' })
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

