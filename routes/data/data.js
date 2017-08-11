var express = require('express')
var router = express.Router()
var data_ctrl = require('../../controllers/data')
var data_models_ctrl = require('../../controllers/data_models')
/**
 * 插入数据,使用mongoose的models操作数据库
 */
// router.post('/save', data_models_ctrl.save)
/**
 * 更新数据,使用mongoose的models操作数据库
 */
// router.post('/findandupdate', data_models_ctrl.findandupdate)
/**
 *删除操作,使用mongoose的models操作数据库
 */
// router.post('/delete', data_models_ctrl.delete)

/**
 * 插入数据,直接使用mongodb引用操作数据库
 */
router.post('/save', data_ctrl.save)
/**
 * 更新数据,直接使用mongodb引用操作数据库
 */
router.post('/findandupdate', data_ctrl.findandupdate)
/**
 * 删除操作,直接使用mongodb引用操作数据库
 */
router.post('/delete', data_ctrl.delete)
/**
 * 查询操作,直接使用mongodb引用操作数据库
 */
router.post('/find', data_ctrl.find)
/**
 * 从数据库获取获取广告信息单独写为了权限控制
 */
router.get('/getAd', data_ctrl.getAd)
//test
router.post('/test', data_ctrl.test)

module.exports = router
