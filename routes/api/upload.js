var express = require('express')
var router = express.Router()
var upload_ctrl = require('../../controllers/upload')

router.post('/uploadImg64',upload_ctrl.uploadImg64)
router.post('/uploadImg64Qn',upload_ctrl.uploadImg64Qn)
module.exports = router
