var Auth = require('../models/auth')
var StringToken = require('../models/stringtoken')
var code = require('../utils/error_code')

exports.passwordResetEmail = function (req, res, next) {
  var stringtoken = req.query.stringtoken
  return res.render('../views/link/passwordResetEmail', { layout: false, stringtoken: stringtoken })
}

exports.createUserEmail = function (req, res, next) {
  var stringtoken = req.query.stringtoken
  if (!stringtoken){
		return res.render('../views/link/createUserEmail', { layout: false, code: code.getErrorCode_name('user_params_null'), msg: code.getErrorMessage_name('user_params_null') })//输入的参数不能为空
	}

  StringToken.findOneAsync({ stringtoken: stringtoken }).then(doc => {
		if (!doc) {
      return res.render('../views/link/createUserEmail', { layout: false, code: code.getErrorCode_name('user_stringtoken_noexist'), msg: code.getErrorMessage_name('user_stringtoken_noexist') })//验证码已经失效或错误
		}
		var email = doc.email
		const updates = {
			$set: {
				activate: '0'
			}
		}
		const find = {
			email: email
		}
		doc.remove()
		Auth.findOneAndUpdateAsync(find, updates).then(doc => {
      return res.render('../views/link/createUserEmail', { layout: false, code: 0, msg: '激活成功' })
		})
	}).catch(err => {
    return res.render('../views/link/createUserEmail', { layout: false, code: 99999, msg: err.message })
	})

}