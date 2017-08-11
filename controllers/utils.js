var URL = require('url');
var glob = require("glob");
var svgCaptcha = require('svg-captcha');

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
        return res.api_error( { code: 99999, msg: err.message })
    }
    return res.api(files, { code: 0, msg: '交易成功' })
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
      width:width,
      height:height,
      size: 4,
      color: true,
      ignoreChars: '0o1i'
    }
    var captcha = svgCaptcha.create(options);
    req.session.captcha = captcha.text;
    res.set('Content-Type', 'image/svg+xml');
    res.status(200).send(captcha.data);
}