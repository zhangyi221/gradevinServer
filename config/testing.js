/**
 * 测试环境
 */

module.exports = {
  host: 'http://localhost',
  port: 80,
  logging: {
    type: 'combined' // Standard Apache combined log output
  },
  NODE_ENV: 'testing',
  BASE_URI: 'http://ip/api',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 10 * 1000,//测试10秒

  AUTH_EMAIL_ACTIVE: true,//账户注册是否需要邮件激活
  // 一般token过期策略：移动端按月
  TOKEN_EXPIRATION: 60 * 60 * 24, // 单位秒
  STRING_TOKEN_EXPIRATION:'1*60*60',//1小时1*60*60
  //token认证排除目录
  unlesspath: [
    // /^\/api/,
    /^\/utils/,
    /^\/swagger/,
    // /^\/views/,
    /^\/data\/data\/getAd/,//广告信息
    /^\/images/,//图片
    /^\/uploads/,//上传图片
    /^\/api\/auth\/signInWithEmailAndPassword/,//邮箱密码登录
    /^\/api\/auth\/signInWithPhone/,//手机号登录
    /^\/api\/auth\/createUserIsUsedByPhone/,//查询手机号是否被注册
    /^\/api\/auth\/createUserIsUsedByEmail/,//查询邮箱是否被注册
    /^\/api\/auth\/sendPasswordResetEmail/,//通过邮箱重置密码
    /^\/api\/auth\/createUserWithEmailAndPassword/,//客户注册
    /^\/api\/auth\/resendStringTokenByEmail/,//重发邮件
    /^\/api\/utils/,//图形验证码/获取图片等等
    /^\/web/,/^\/views/,/^\/static/,/^\/api\/user\/updatePasswordByStringtoken/,//web接口
    // /^(?!\/rest\/).*/ // 所有非rest路由
  ]
}
