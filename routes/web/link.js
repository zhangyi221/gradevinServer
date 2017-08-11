/**
 * 重置密码路由
 */

var express = require('express')
var router = express.Router()
var link_ctrl = require('../../controllers/link')
//注册激活
router.get('/createUserEmail', link_ctrl.createUserEmail) 
//重置密码
router.get('/passwordResetEmail', link_ctrl.passwordResetEmail) 
module.exports = router
