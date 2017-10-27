var mongoose = require('mongoose');
var URL = require('url');
var glob = require("glob");
var svgCaptcha = require('svg-captcha');
var request = require('request');
var utils_ctrl = require('./utils')
var code = require('../utils/error_code')
var _ = require('lodash')
/**
 * 获取指定目录下jpg文件个数
 * @param path
请求
images/ad/home/slides/
返回
{
  "data": {
    "MediaUrl": [
      "guanggao1.jpg",
      "guanggao2.jpg"
    ]
  },
  "status": {
    "code": 0,
    "msg": "交易成功"
  }
}
 */
exports.getJpg = function (req, res) {
  var params = URL.parse(req.url, true).query;
  var pathtype = params.path;
  try {
    var pattern = process.cwd() + '/public/' + pathtype + '**/*.jpg';

    var files = glob.sync(pattern);
    for (var i = 0; i < files.length; i++) {
      var start = files[i].lastIndexOf('/') + 1;
      files[i] = files[i].substring(start, files[i].length);
    }
  } catch (err) {
    return res.api_error({ code: 99999, msg: err.message })
  }
  return res.api(files, { code: 0, msg: '交易成功' })
}
exports.getAd = function (req, res) {
  var document_path = 'ad'
  var path = req.query.path
  mongoose.connection.db.collection(document_path).find({ "path": path }, { _id: 0 }).toArray().then(doc => {
    return res.api(doc, { code: 0, msg: '查询成功' })
  }).catch(err => {
    return res.api_error({ code: 99999, msg: err.message })
  })
}
/**
 * 发送短信
 * @param mobile 手机号
 * @param temp_id 模板id

发送成功
{"msg_id": "288193860302"}
发送失败

{
    "error": {
        "code": *****,
        "message": "******"
    }
}
 */
exports.sendSMS = function (req, res) {
  let mobile = req.body.mobile
  let temp_id = req.body.temp_id
  let appKey = require('../config/jpush').appKey
  let masterSecret = require('../config/jpush').masterSecret
  let sendsmsurl = require('../config/jpush').sendsmsurl
  let basicToken = appKey + ':' + masterSecret
  let basicToken_buffer = new Buffer(basicToken)
  let basicTokenBase64 = basicToken_buffer.toString('base64');

  let options = {
    url: sendsmsurl,
    headers: {
      'Authorization': 'Basic ' + basicTokenBase64,
      'content-type': 'application/json; charset=utf-8'
    },
    json: true,
    body: {
      mobile: mobile,
      temp_id: temp_id
    }
  }
  request.post(options, function (err, httpResponse, body) {
    if (err) {
      return res.api_error({ code: 99999, msg: err.message })
    }
    if (typeof (body.error) != 'undefined') {
      return res.api_error({ code: body.error.code, msg: body.error.message })
    }
    if (typeof (body.msg_id) != 'undefined') {
      req.session.msg_id = body.msg_id;
      //res.cookie('msg_id', body.msg_id)
    }
    return res.api(body, { code: 0, msg: '发送成功' })
  })
}
/**
 * 校验短信验证码
 *
{
  "verification": "123456",
}
验证通过

{
    "is_valid": true
}
验证不通过

{
    "is_valid": false,
    "error": {
        "code": *****,
        "message": "******"
    }
}
 */
exports.smsValid = async function (req, res) {
  let isvalid 
  isvalid = await utils_ctrl.smsValid_boolean(req)
  if (!isvalid) {
    return res.api_error({ code: code.getErrorCode_name('auth_verification_err'), msg: code.getErrorMessage_name('auth_verification_err') })
  } else {
    return res.api({"is_valid": true}, { code: 0, msg: '校验成功' })
  }
}
/**
 * 校验短信验证码
 * return boolean
 */
exports.smsValid_boolean = function (req) {
  let msg_id = req.session.msg_id//发送短信后记录的msg_id
  //let msg_id = req.cookies.msg_id//发送短信后记录的msg_id
  let verification = req.body.verification//客户输入的短信验证码
  console.log('短信验证msg_id', msg_id)
  console.log('短信验证verification', verification)
  if (!msg_id || !verification) return false
  let appKey = require('../config/jpush').appKey
  let masterSecret = require('../config/jpush').masterSecret
  let smsvalidurl = _.clone(require('../config/jpush').smsvalidurl)
  smsvalidurl = smsvalidurl.replaceAll('{msg_id}', msg_id)
  let basicToken = appKey + ':' + masterSecret
  let basicToken_buffer = new Buffer(basicToken)
  let basicTokenBase64 = basicToken_buffer.toString('base64');

  let options = {
    url: smsvalidurl,
    headers: {
      'Authorization': 'Basic ' + basicTokenBase64,
      'content-type': 'application/json; charset=utf-8'
    },
    json: true,
    body: {
      code: verification
    }
  }
  return new Promise(function (resolve, reject) {
    request.post(options, function (err, httpResponse, body) {
      if (err) {
        console.log('短信验证码err', err)
        // return res.api_error( { code: 99999, msg: err.message })
        resolve(false)
      }
      if (typeof (body.error) != 'undefined') {
        console.log('短信验证码失败', body)
        // return res.api_error( { code: body.error.code, msg: body.error.message })
        resolve(false)
      }
      // return res.api(body, { code: 0, msg: '发送成功' })
      resolve(true)
    })
  })

}


/**
 * @api {get} /common/captcha/:width/:height 验证码
 * @apiDescription 验证码
 * @apiName captcha
 *
 * @apiParam {String} width 宽度
 * @apiParam {String} height 高度
 * 
 */
exports.captcha = function (req, res) {
  var width = req.query.width || 150
  var height = req.query.height || 50
  var options = {
    width: width,
    height: height,
    size: 4,
    color: true,
    ignoreChars: '0o1i'
  }
  var captcha = svgCaptcha.create(options);
  req.session.captcha = captcha.text;
  res.set('Content-Type', 'image/svg+xml');
  res.status(200).send(captcha.data);
}

/**
 * 校验验证码captcha
 */
exports.captchaValid = function (req, res) {
  let captcha_ = req.body.captcha//上传captcha
  let captcha = req.session.captcha//服务端captcha
  if (!_.isEqual(_.toUpper(captcha_), _.toUpper(captcha))) {
    //请正确输入验证码
    return res.api_error({ code: code.getErrorCode_name('auth_captcha_err'), msg: code.getErrorMessage_name('auth_captcha_err') })
  } else {
    return res.api(null, { code: 0, msg: '校验成功' })
  }
}
