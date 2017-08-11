var express = require('express')
var auth_ctrl = require('../../controllers/auth')
var data_ctrl = require('../../controllers/data')
var router = express.Router()


// 以邮箱和密码的方式登录
router.post('/signInWithEmailAndPassword', auth_ctrl.signInWithEmailAndPassword)
// 新增用户
router.post('/createUserWithEmailAndPassword', auth_ctrl.createUserWithEmailAndPassword)
// 通过邮箱重置密码
router.post('/sendPasswordResetEmail', auth_ctrl.sendPasswordResetEmail)
// 退出登录
router.get('/signOut', auth_ctrl.signOut)
// 重新发送邮件stringtoken
router.post('/resendStringTokenByEmail', auth_ctrl.resendStringTokenByEmail)
// 测试
// router.get('/test', data_ctrl.test)

module.exports = router
