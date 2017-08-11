/**
 * 上传逻辑控制器
 */
var fs = require("fs");
var qiniu = require('../utils/qiniu')

var util = require('../utils/util')
var config = require('../config/' + process.env.NODE_ENV)
/**
* 上传图片保存至uploads目录
* @param imageBase64
* 返回
*/
exports.uploadImg64 = function (req, res) {
    var imageBase64 = req.body.imageBase64
    var path = req.body.path//avatars
    if (!imageBase64 && !path) {
        return res.api_error({ code: code.getErrorCode_name('user_params_null'), msg: code.getErrorMessage_name('user_params_null') })//输入的参数不能为空
    }
    var base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');

    var imageType = util.getImageType(dataBuffer.toString('hex', 0, 4))
    if (req.session.user) {
        var user_id = req.session.user._id.toString()
        var url = process.cwd() + '/public/uploads/' + path + '/'
        var filename = user_id
        if (imageType && imageType != 'other') {
            filename = filename + '.' + imageType
        }
        var urlname = url + filename
        fs.writeFile(urlname, dataBuffer, function (err) {
            if (err) {
                return res.api_error({ code: 99999, msg: err.message })
            } else {
                var data = {
                    key: filename,
                    link: config.host + ':' + config.port + '/uploads/' + path + '/'
                }
                return res.api(data, { code: 0, msg: '上传成功' })
            }
        });
    } else {
        return res.api_error({ code: code.getErrorCode_name('user_session_null'), msg: code.getErrorMessage_name('user_session_null') })//session失效
    }
}

/**
* 上传图片保存至uploads目录
* @param imageBase64
* 返回
*/
exports.uploadImg64Qn = function (req, res) {
    var imageBase64 = req.body.imageBase64
    var path = req.body.path
    if (!imageBase64 && !path) {
        return res.api_error({ code: code.getErrorCode_name('user_params_null'), msg: code.getErrorMessage_name('user_params_null') })//输入的参数不能为空
    }
    var base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    var dataBuffer = new Buffer(base64Data, 'base64');
    var _id = req.session.user._id.toString()
    var random = Math.random().toString(36).substr(2)
    var url = path + random
    

    // @param options 列举操作的可选参数
    //                prefix    列举的文件前缀
    //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
    //                limit     每次返回的最大列举文件数量
    //                delimiter 指定目录分隔符
    var options = {
        prefix: path
    }
    var bucketManager = qiniu.bucketManager()
    //查找指定目录下所有文件
    bucketManager.listPrefix(qiniu.bucket, options, function (respErr, respBody, respInfo) {
        if (respErr) {
            return res.api_error({ code: respErr.code, msg: respErr.message })
        }
        if (respInfo.statusCode == 200) {
            var items = respBody.items;
            if (items.length > 0) {
                //删除再添加
                var deleteOperations = []
                items.forEach(function (item) {
                    deleteOperations.push(qiniu.qiniu.rs.deleteOp(qiniu.bucket, item.key))
                })
                //删除指定文件
                bucketManager.batch(deleteOperations, function (respErr, respBody, respInfo) {
                    if (respErr) {
                        return res.api_error({ code: respErr.code, msg: respErr.message })
                    } else {
                        // 200 is success, 298 is part success
                        if (parseInt(respInfo.statusCode / 100) == 2) {
                            // respBody.forEach(function (item) {
                            //     if (item.code == 200) {
                            //         console.log(item.code + "\tsuccess");
                            //     } else {
                            //         console.log(item.code + "\t" + item.data.error);
                            //     }
                            // });

                            uploadQN(url, dataBuffer, res)
                        } else {
                            return res.api_error({ code: respInfo.statusCode, msg: respInfo.data.error })
                        }
                    }
                })
            } else {
                //直接添加
                uploadQN(url, dataBuffer, res)
            }
        } else {
            return res.api_error({ code: respInfo.statusCode, msg: respInfo.data.error })
        }
    })
}

function uploadQN(url, dataBuffer, res) {
    var formUploader = qiniu.formUploader()
    var putExtra = qiniu.putExtra()
    var uploadToken = qiniu.uploadToken(url)
    formUploader.put(uploadToken, url, dataBuffer, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
            return res.api_error({ code: respErr.code, msg: respErr.message })
        }
        if (respInfo.statusCode == 200) {
            respBody['link'] = qiniu.link
            return res.api(respBody, { code: 0, msg: '上传成功' })
        } else {
            return res.api_error({ code: respInfo.statusCode, msg: respInfo.data.error })
        }
    })
}
