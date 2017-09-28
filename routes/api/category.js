var express = require('express')
var category_ctrl = require('../../controllers/category')
var router = express.Router()

/**
 * 获取有顺序的的类别表
 */
router.get('/getCategory', category_ctrl.getCategory)
/**
 * 获取有顺序的的子类别表
 */
router.get('/getSubCategory', category_ctrl.getSubCategory)

// // 以邮箱和密码的方式登录
// router.post('/signInWithEmailAndPassword', auth_ctrl.signInWithEmailAndPassword)
// // 退出登录
// router.get('/signOut', auth_ctrl.signOut)
// // 重新发送邮件stringtoken
// router.post('/resendStringTokenByEmail', auth_ctrl.resendStringTokenByEmail)

module.exports = router
