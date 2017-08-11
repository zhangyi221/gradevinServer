var express = require('express')
var router = express.Router()
var utils_ctrl = require('../../controllers/utils')


router.get('/getJpg', utils_ctrl.getJpg)
router.get('/captcha', utils_ctrl.captcha)

module.exports = router
