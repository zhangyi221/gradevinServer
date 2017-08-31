var express = require('express')
var router = express.Router()
var utils_ctrl = require('../../controllers/utils')


router.get('/getJpg', utils_ctrl.getJpg)//获取图片
router.get('/getAd', utils_ctrl.getAd)//从数据库获取获取广告信息
router.get('/captcha', utils_ctrl.captcha)//获取验证码
router.post('/sendSMS', utils_ctrl.sendSMS)//发送短信
router.post('/smsValid', utils_ctrl.smsValid)//校验短信(test)
router.post('/captchaValid', utils_ctrl.captchaValid)//校验验证码
module.exports = router
