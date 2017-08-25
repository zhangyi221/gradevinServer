var express = require('express')
var router = express.Router()
var utils_ctrl = require('../../controllers/utils')


router.get('/getJpg', utils_ctrl.getJpg)//获取图片
router.get('/captcha', utils_ctrl.captcha)//获取验证码
router.post('/sendSMS', utils_ctrl.sendSMS)//发送短信
router.post('/smsValidTest', utils_ctrl.smsValidTest)//校验短信(test)
module.exports = router
