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
 * @param req
 * @param res
 * @return {"data": null,"status": { "code": 0,"msg": "插入数据成功"} }
 * 请求例子参考models.dynamic.js
 */
exports.save = function (req, res) {
    //document名称
    let document_path = req.body.document
    //document数据
    let document_data = req.body.data
    let model = dynamic.generateModel(req)
    if (_.isEmpty(model)){
        return res.api_error( { code: code.getErrorCode_name('data_model_null'), msg: code.getErrorMessage_name('data_model_null') })//生成Model错误，请检查请求参数格式
    }
    new model(document_data).save().then(doc => {
        delete mongoose.connection.models[document_path]
        return res.api({_id:doc._id}, { code: 0, msg: '插入数据成功' })
    }).catch(err => {
        delete mongoose.connection.models[document_path]
        return res.api_error( { code: 99999, msg: err.message })
    })
}

/**
 * @see 查找并更新,支持one和many
 * @author zhangyi
 * @param req
 * @param res
 * @return {"data": {n:查询个数,m:修改个数},"status": { "code": 0,"msg": "更新数据成功"} }
 * 请求例子参考models.dynamic.js
 */
exports.findandupdate = function (req, res) {
    //document名称
    let document_path = req.body.document
    //find数据
    let document_find = req.body.find
    //update数据
    let document_update = req.body.update
 
    let model = dynamic.generateModel(req)
    if (_.isEmpty(model)){
        return res.api_error( { code: code.getErrorCode_name('data_model_null'), msg: code.getErrorMessage_name('data_model_null') })//生成Model错误，请检查请求参数格式
    }
    //转换update格式
    document_update = {
        $set: document_update
    }
    //转换find格式
    var p_obj = {}
    p_obj = util.positionObject(document_find,p_obj,null)
    if (_.isEmpty(p_obj)){
        delete mongoose.connection.models[document_path]
        return res.api_error( { code: code.getErrorCode_name('data_find_position'), msg: code.getErrorMessage_name('data_find_position') })//find参数数据格式错误
    }
    model.updateManyAsync(p_obj,document_update).then(doc => {
        delete mongoose.connection.models[document_path]
        return res.api({n:doc.n,m:doc.nModified}, { code: 0, msg: '更新数据成功' })
    }).catch(err => {
        delete mongoose.connection.models[document_path]
        return res.api_error( { code: 99999, msg: err.message })
    })
}

/**
 * 用动态生成model方式删除数据太复杂(已测)
 * @see 删除,支持one和many
 * @author zhangyi
 * @param req
 * @param res
 * @return {"data": {n:删除个数},"status": { "code": 0,"msg": "删除数据成功"} }
 * 请求例子参考models.dynamic.js
 */
exports.delete = function (req, res) {
    //document名称
    let document_path = req.body.document
    //find数据
    let document_find = req.body.find
 
    let model = dynamic.generateModel(req)
    if (_.isEmpty(model)){
        return res.api_error( { code: code.getErrorCode_name('data_model_null'), msg: code.getErrorMessage_name('data_model_null') })//生成Model错误，请检查请求参数格式
    }
    //转换find格式
    var p_obj = {}
    p_obj = util.positionObject(document_find,p_obj,null)
    if (_.isEmpty(p_obj)){
        delete mongoose.connection.models[document_path]
        return res.api_error( { code: code.getErrorCode_name('data_find_position'), msg: code.getErrorMessage_name('data_find_position') })//find参数数据格式错误
    }
    model.deleteManyAsync(p_obj).then(doc => {
        delete mongoose.connection.models[document_path]
        return res.api({n:doc.n}, { code: 0, msg: '删除数据成功' })
    }).catch(err => {
        delete mongoose.connection.models[document_path]
        return res.api_error( { code: 99999, msg: err.message })
    })
}