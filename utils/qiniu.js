// var qn = require('qn')

// var qnOptions = {
//     accessKey: 'jNrjnDx1PNcmcv_IznqUNqct1KIqOFdKwwqcVzcI',
//     secretKey: 'sCDZU5sBjyoQeSb2LQadvqoHSLsrcxKeFmG1DK0P',
//     bucket: 'hussar',
//     origin: 'http://oriku7msr.bkt.clouddn.com',
//     uploadURL: 'http://up-z1.qiniu.com'
//   // timeout: 3600000, // default rpc timeout: one hour, optional 
//   // if your app outside of China, please set `uploadURL` to `http://up.qiniug.com/` 
//   // uploadURL: 'http://up.qiniu.com/', 
// }
// exports.client = function () {
//     return qn.create(qnOptions)
// }
var qiniu = require('qiniu')
var accessKey = 'jNrjnDx1PNcmcv_IznqUNqct1KIqOFdKwwqcVzcI'
var secretKey = 'sCDZU5sBjyoQeSb2LQadvqoHSLsrcxKeFmG1DK0P'
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
var config = new qiniu.conf.Config()
var link = 'http://oriku7msr.bkt.clouddn.com/'
config.zone = qiniu.zone.Zone_z1
var bucket = 'hussar'
var options = {
  scope: bucket
}

exports.formUploader = function () {
    return new qiniu.form_up.FormUploader(config)
}

exports.uploadToken  = function (keyToOverwrite) {
    if (keyToOverwrite){
        options.scope = 'hussar'  + ":" + keyToOverwrite
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac)
    return uploadToken
}
exports.putExtra = function () {
    return new qiniu.form_up.PutExtra()
}
exports.link = link

exports.bucketManager = function () {
    return new qiniu.rs.BucketManager(mac, {scope: bucket})
}
exports.bucket = bucket
exports.qiniu = qiniu