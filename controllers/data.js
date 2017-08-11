/**
 * 数据操作逻辑控制器
 */
var mongoose = require('mongoose');
var assert = require('assert');
var _ = require('lodash');
var code = require('../config/error_code')
var util = require('../utils/util')
var dynamic = require('../models/dynamic')

/**
 * @see 插入数据
 * @author zhangyi
 * @param {文档名称} req.body.document
 * @param {插入数据} req.body.data
 * @return {"data": null,"status": { "code": 0,"msg": "插入数据成功"} }
{
    "document": "testabc",
    "data": {
        "name": "testname1",
        "email": "1111@1111.com",
        "password": "111111",
        "auth": {
            "role": false,
            "father": "supper",
            "testaa": {
                "aa": new Date,
                "bb": "321321"
            }
        }
    }
}
 */
exports.save = function (req, res) {
    //document名称
    let document_path = req.body.document
    //document数据
    let document_data = req.body.data
    mongoose.connection.db.collection(document_path).insertOne(document_data).then(doc => {
        return res.api({ n: doc.result.n }, { code: 0, msg: '保存数据成功' })
    }).catch(err => {
        return res.api_error( { code: 99999, msg: err.message })
    })
}

/**
 * @see 查找并更新,支持one和many
 * @author zhangyi
 * @param {文档名称} req.body.document
 * @param {查询条件} req.body.find
 * @param {更新数据} req.body.update
 * @return {"data": {n:查询个数,m:修改个数},"status": { "code": 0,"msg": "更新数据成功"} }
{
  "document": "testabc",
  "operation": "update",
  "find": {
    "email": "111@111.com",
    "auth": {
      "role": false,
      "testaa": {
        "bb": "321321"
      }
    }
  },
  "update": {
    "name": "testname11"
  }
}
 */
exports.findandupdate = function (req, res) {
    //document名称
    let document_path = req.body.document
    //find数据
    let document_find = req.body.find
    //update数据
    let document_update = req.body.update
    //转换update格式
    document_update = {
        $set: document_update
    }
    //转换find格式
    var p_obj = {}
    p_obj = util.positionObject(document_find, p_obj, null)
    if (_.isEmpty(p_obj)) {
        return res.api_error( { code: code.getErrorCode_name('data_find_position'), msg: code.getErrorMessage_name('data_find_position') })//find参数数据格式错误
    }
    mongoose.connection.db.collection(document_path).updateMany(p_obj, document_update).then(doc => {
        return res.api({ n: doc.result.n, m: doc.result.nModified }, { code: 0, msg: '更新数据成功' })
    }).catch(err => {
        return res.api_error( { code: 99999, msg: err.message })
    })
}

/**
 * @see 删除
 * @author zhangyi
 * @param {文档名称} req.body.document
 * @param {查询条件} req.body.find
 * @return {"data": {n:删除个数},"status": { "code": 0,"msg": "删除数据成功"} }
 * 
{
    "document": "testabc",
    "find": {
        "name": "testname12",
        "auth": {
            "testaa": {
                "bb": {
                "$lt" : "321321"
                }
            }
        }
    },
}
 */
exports.delete = function (req, res) {
    //document名称
    let document_path = req.body.document
    //find数据
    let document_find = req.body.find
    //转换find格式
    var p_obj = {}
    p_obj = util.positionObject(document_find, p_obj, null)
    if (_.isEmpty(p_obj)) {
        return res.api_error( { code: code.getErrorCode_name('data_find_position'), msg: code.getErrorMessage_name('data_find_position') })//find参数数据格式错误
    }
    mongoose.connection.db.collection(document_path).deleteMany(p_obj).then(doc => {
        return res.api({ n: doc.result.n }, { code: 0, msg: '删除数据成功' })
    }).catch(err => {
        return res.api_error( { code: 99999, msg: err.message })
    })
}
/**
 * @see 查询
 * @author zhangyi
 * @param {文档名称} req.body.document
 * @param {查询条件} req.body.find
 * @param {显示条件} req.body.show
 * @param {不显示条件,与显示条件同时存在是只可为_id} req.body.noshow
 * @return {"data": {数据},"status": { "code": 0,"msg": "查询成功"} }
 * 
 {
  "document": "testabc",
  "find": {
    "name": "testname12",
    "auth": {
      "testaa": {
        "bb": {
          "$lt": "321321"
        }
      }
    }
  },
  "show": [
    "name",
    "email",
    "role"
  ],
  "noshow": [
    "password",
    "_id",
    "__v"
  ]
}
 */
exports.find = function (req, res) {
    let document_path = req.body.document
    let find = req.body.find
    let show = req.body.show
    let noshow = req.body.noshow
    let show_n = _.isEmpty(show) ? 0 : show.length
    let noshow_n = _.isEmpty(noshow) ? 0 : noshow.length
    let show_obj = _.zipObject(show, _.fill(Array(show_n), 1))
    let noshow_obj = _.zipObject(noshow, _.fill(Array(noshow_n), 0))
    //存在显示条件
    if (!_.isEmpty(show_obj)) {
        //同时还存在不显示条件,除了仅允许的_id外其他都抛错
        if (!_.isEmpty(noshow_obj) && (noshow_n > 1 || !_.isEqual(noshow_obj['_id'], 0))) {
            return res.api_error( { code: code.getErrorCode_name('data_Projection_err'), msg: code.getErrorMessage_name('data_Projection_err') })//显示参数设置异常
        }

    }
    var p_obj = {}
    p_obj = util.positionObject(find, p_obj, null)
    mongoose.connection.db.collection(document_path).find(p_obj, _.merge(show_obj, noshow_obj)).toArray().then(doc => {
        return res.api(doc, { code: 0, msg: '查询成功' })
    }).catch(err => {
        return res.api_error( { code: 99999, msg: err.message })
    })
}
exports.getAd = function (req, res) {
    let document_path = 'ad'
    let path = req.query.path
    mongoose.connection.db.collection(document_path).find({"path": path}, {_id:0}).toArray().then(doc => {
        return res.api(doc, { code: 0, msg: '查询成功' })
    }).catch(err => {
        return res.api_error( { code: 99999, msg: err.message })
    })
}

exports.test = function (req, res) {
    return res.api(doc, { code: 0, msg: '成功' })
}