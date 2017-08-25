var URL = require('url');
var glob = require("glob");
var svgCaptcha = require('svg-captcha');
var request = require('request');
var utils_ctrl = require('./utils')
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
    }
    return res.api(body, { code: 0, msg: '发送成功' })
  })
}
/**
 * 校验短信验证码(测试专用)
 */
exports.smsValidTest = async function (req, res) {
  req.session.msg_id = req.body.msg_id
  let verification = req.body.verification
  return res.api({ is_valid: await utils_ctrl.smsValid(req) }, { code: 0, msg: '校验完成' })
}
/**
 * 校验短信验证码
 * 
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
exports.smsValid = function (req) {
  let msg_id = req.session.msg_id//发送短信后记录的msg_id
  let verification = req.body.verification//客户输入的短信验证码
  let appKey = require('../config/jpush').appKey
  let masterSecret = require('../config/jpush').masterSecret
  let smsvalidurl = require('../config/jpush').smsvalidurl
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
  // request.post(options).then(err,httpResponse,body =>{
  //   if (err) {
  //     console.log('短信验证码err',err)
  //       // return res.api_error( { code: 99999, msg: err.message })
  //       return false
  //   }
  //   if (typeof(body.error) != 'undefined'){
  //      console.log('短信验证码失败',body)
  //     // return res.api_error( { code: body.error.code, msg: body.error.message })
  //     return false
  //   }
  //   // return res.api(body, { code: 0, msg: '发送成功' })
  //   return true
  // }).catch(err => {
  //   //return res.api_error({ code: 99999, msg: err.message })
  //   return false
  // })
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
  // var width = parseInt(req.params.width) || 80
  // var height = parseInt(req.params.height) || 30
  // var code = req.session.code = parseInt(Math.random() * 9000 + 1000)
  // var captcha = new captchapng(width, height, code)

  // captcha.color(0, 0, 0, 0)
  // captcha.color(80, 80, 80, 255)

  // var img = captcha.getBase64()
  // var imgbase64 = new Buffer(img, 'base64')
  // res.end(imgbase64)
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