var config = require('../config/' + process.env.NODE_ENV)

module.exports = {
  // SERVICE: 'Gmail',
  // EMAIL_USER: 'zymailers@gmail.com',
  // EMAIL_PASS: 'zymailer',
  SERVICE: '163',
  EMAIL_USER: 'zymailers@163.com',
  EMAIL_PASS: 'zy0123456789',
  EMAIL_SECURE: true,//使用TLS true

  //修改密码配置
  resetpass_message: {
    from: 'gradevin,<zymailers@163.com>', // 发件箱
    to: '',//收件箱
    subject: '感谢您使用，请继续完成操作',//标题
    headers: { 'X-Laziness-level': 1000 },//自定义标头
    //邮件内容需要替换%replace%
    html: '<p>请点击此链接完成重置密码操作</p>' + 
    '<p>请注意：不支持IE9以下浏览器</p>' + 
    '<a href='+ config.host + ':' + config.port + '/web/link/passwordResetEmail?stringtoken=${a}>' +
    config.host + ':' + config.port + '/web/link/passwordResetEmail?stringtoken=${a}</a>',
  },
  //注册激活配置
  sign_message: {
    from: 'gradevin,<zymailers@163.com>', // 发件箱
    to: '',//收件箱
    subject: '感谢您使用，请继续完成操作',//标题
    headers: { 'X-Laziness-level': 1000 },//自定义标头
    //邮件内容需要替换%replace%
    html: '<p>请点击此链接完成激活操作</p>' + 
    '<p>请注意：不支持IE9以下浏览器</p>' + 
    '<a href='+ config.host + ':' + config.port + '/web/link/createUserEmail?stringtoken=${a}>' +
    config.host + ':' + config.port + '/web/link/createUserEmail?stringtoken=${a}</a>',
  },

}