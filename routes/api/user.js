var express = require('express')
var user_ctrl = require('../../controllers/user')
var router = express.Router()

// 获取用户信息
router.get('/current/:uid', user_ctrl.current)
// 获取用户信息
router.get('/currentByToken', user_ctrl.currentByToken)
// 更新用户
router.put('/current/:uid', user_ctrl.update)
//删除当前用户，删除成功之后会退出登录
router.delete('/current/:uid', user_ctrl.delete)
// 修改用户的密码,stringtoken
router.post('/updatePasswordByStringtoken', user_ctrl.updatePasswordByStringtoken)
// 修改用户的密码
// router.post('/updatePassword', user_ctrl.updatePassword)

module.exports = router
