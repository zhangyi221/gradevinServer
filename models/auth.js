/**
* 客户信息模型
* displayName,帐户名称
* email,帐户主邮箱地址
* phone,帐户手机号
* phoneVerified,帐户的手机号是否被验证过
* isAnonymous,帐户是否是匿名帐户认证
* photoURL,帐户照片地址
* providerData,帐户下所有身份提供商信息
* providerId,当前帐户登录使用的身份认证提供商名称，例如 weibo，weixin。
* uid,用户id,这里是Wilddog Id
* password,密码
* createDate,创建日期
* updateDate,更新日期
* lockUntil,锁过期时间
* loginAttempts,登录失败次数
* isActivate,账户注册时是否需要用户邮箱激活激活
* actives,激活状态,0激活,1发送邮件待验证
*/
var mongoose = require('mongoose');
//var md5 = require('../utils/md5')

var config = require('../config/' + process.env.NODE_ENV)
var MAX_LOGIN_ATTEMPTS = config.MAX_LOGIN_ATTEMPTS
var LOCK_TIME          = config.LOCK_TIME

var ObjectId = mongoose.Schema.Types.ObjectId
var UserSchema = mongoose.Schema({

    displayName: {
        type: String
    },
    email: {
        type: String,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    phoneVerified: Boolean,
    isAnonymous: Boolean,
    photoURL: String,
    providerData: mongoose.Schema.Types.Mixed,
    providerId: String,
    createDate: {
        type: Date,
        default: Date.now
    },
    updateDate: Date,
    lockUntil: { 
    	type: Number
    },
    loginAttempts: { 
		type    : Number, 
		required: true, 
		default : 0
	},
    isActivate: {
        type: Boolean,
        required: true,
        default: false
    },
    activate: {
        type: String,
        required: true,
        default: '0'//0激活,1未激活
    }
})

var reasons = UserSchema.statics.failedLogin = {
	NOT_FOUND         : 0,
	PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS      : 2,
    NOT_ACTIVE        : 3
}

UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now())
})
UserSchema.methods.comparePassword = function(candidatePassword) {
    return candidatePassword === this.password
	//return md5(candidatePassword) === this.password
}

UserSchema.methods.incLoginAttempts = function() {
    // 如果我们有一个过期的锁，则在1处重新启动
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateAsync({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        })
    }
    // 否则我们递增
    const updates = { $inc: { loginAttempts: 1 } }
    // 如果我们已经达到了最大的尝试并且它还没有锁定，那么锁定帐户
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME }
    }
    return this.updateAsync(updates)
}

UserSchema.statics.getAuthenticated = function(email, password) {
    return this.findOneAsync({email: email})
    .then(doc => {
    	// make sure the user exists
    	if (!doc) {
    		return reasons.NOT_FOUND
        }
        // check avtive
        if (doc.isActivate && doc.activate != 0){
            return reasons.NOT_ACTIVE
        }
    	// check if the account is currently locked
    	if (doc.isLocked) {
    		return doc.incLoginAttempts().then(() => reasons.MAX_ATTEMPTS)
    	}
    	// test for a matching password
    	if (doc.comparePassword(password)) {
    		// if there's no lock or failed attempts, just return the doc
    		if (!doc.loginAttempts && !doc.lockUntil) return doc
    		// reset attempts and lock info
    		const updates = {
                $set: { loginAttempts: 0 },
                $unset: { lockUntil: 1 }
            }
            return doc.updateAsync(updates).then(() => doc)
    	}
    	// password is incorrect, so increment login attempts before responding
    	return doc.incLoginAttempts().then(() => reasons.PASSWORD_INCORRECT)
    })
}
module.exports = mongoose.model("user",UserSchema)