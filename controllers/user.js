/**
 * 认证逻辑控制器
 */
var mongoose = require('mongoose');
var Auth = require('../models/auth')
var StringToken = require('../models/stringtoken')
var code = require('../config/error_code')
var util = require('../utils/util')
var push = require('../utils/socketio-push')
var redis = require('../utils/redis')
/**
 * 获取用户信息
 * param uid
 * 返回user
 */
exports.current = function (req, res) {
	var uid = req.params.uid
	if (!mongoose.Types.ObjectId.isValid(uid)){//校验uid规则
		return res.api_error( { code: code.getErrorCode_name('user_uid_Valid'), msg: code.getErrorMessage_name('user_uid_Valid') })//用户名不存在或已经删除
	}
	Auth.findOneAsync({ _id: uid },'-password -__v').then(doc => {
		if (!doc) {
			return res.api_error( { code: code.getErrorCode_name('auth_name_noexist'), msg: code.getErrorMessage_name('auth_name_noexist') })//用户名不存在或已经删除
		}
		
		return res.api(doc, { code: 0, msg: '交易成功' })
		//return res.api(0, '登录成功', user: doc )
	}).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}
/**
 * 获取用户信息
 * param uid
 * 返回user
 */
exports.currentByToken = function (req, res) {
	if (req.session.user){
		return res.api(req.session.user, { code: 0, msg: '交易成功' })
	}else{
		return res.api_error( { code: code.getErrorCode_name('user_session_null'), msg: code.getErrorMessage_name('user_session_null') })//session失效
	}
}
/**
 * 删除用户信息
 * param uid
 */
exports.delete = function (req, res) {
	var uid = req.params.uid
	if (!mongoose.Types.ObjectId.isValid(uid)){//校验uid规则
		return res.api_error( { code: code.getErrorCode_name('user_uid_Valid'), msg: code.getErrorMessage_name('user_uid_Valid') })//用户名不存在或已经删除
	}
    Auth.findOneAsync({ _id: uid }).then(doc => {
        if (!doc) {
			return res.api_error( { code: code.getErrorCode_name('auth_name_noexist'), msg: code.getErrorMessage_name('auth_name_noexist') })//用户名不存在或已经删除
		}
        res.clearCookie('token')
        return res.api(doc, { code: 0, msg: '交易成功' })

    }).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}
/**
 * 修改用户的密码,
 * @param password
 * @param stringtoken
 * 返回
 */
exports.updatePasswordByStringtoken = function (req, res) {
	var password = req.body.password
	var stringtoken = req.body.stringtoken

	if (!password || !stringtoken){
		return res.api_error( { code: code.getErrorCode_name('user_params_null'), msg: code.getErrorMessage_name('user_params_null') })//输入的参数不能为空
	}
	
	StringToken.findOneAsync({ stringtoken: stringtoken }).then(doc => {
		if (!doc) {
			return res.api_error( { code: code.getErrorCode_name('user_stringtoken_noexist'), msg: code.getErrorMessage_name('user_stringtoken_noexist') })//验证码已经失效或错误
		}
		var email = doc.email
		const updates = {
			$set: {
				password: password
			}
		}
		const find = {
			email: email
		}
		doc.remove()
		Auth.findOneAndUpdateAsync(find, updates).then(doc => {
			return res.api( { code: 0, msg: '密码修改成功' })
		})
	}).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}
/**
 * 修改user数据,
 * param password
 * 返回
 */
exports.update = function (req, res) {
	var uid = req.params.uid
	if (!uid){
		//将采用token对应_id
		uid = req.session.user._id
	}
	var obj_body = req.body
	if (!obj_body){
		return res.api_error( { code: code.getErrorCode_name('user_params_null'), msg: code.getErrorMessage_name('user_params_null') })//输入的参数不能为空
	}
	const updates = {
		$set: {
			obj_body
		}
	}
	Auth.findOneAsync({ _id: uid }).then(doc => {
		doc.set(obj_body)
		doc.save()
		req.session.user = doc
		// sending to individual socketid (private message)
		var msg = JSON.stringify(doc)
		push.pushMsgToSingleDevice(req.session.user._id.toString(),'user',msg)
  		//io.to(req.session.user._id).emit('private system message','123123');
		//res.io.sendSysMessange(req.session.user._id,'123123')
		return res.api(doc, { code: 0, msg: '交易成功' })
	}).catch(err => {
		return res.api_error( { code: 99999, msg: err.message })
	})
}
