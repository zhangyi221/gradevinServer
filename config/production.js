/**
 * 生产环境
 */

module.exports = {
  host: 'http://52.15.171.130',
  port: 8000,
  logging: {
    type: 'combined' // Standard Apache combined log output
  },
  NODE_ENV: 'production',
  BASE_URI: 'http://ip/api',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 300 * 1000,//5分钟

  AUTH_EMAIL_ACTIVE: true,//账户注册是否需要邮件激活
  // 一般token过期策略：移动端按月
  TOKEN_EXPIRATION: 60 * 60 * 24, // 单位秒
  STRING_TOKEN_EXPIRATION:'1*60*60',//1小时1*60*60
  //token认证排除目录
  unlesspath: [
    // /^\/api/,
    /^\/utils/,
    // /^\/views/,
    /^\/data\/data\/getAd/,//广告信息
    /^\/images/,//图片
    /^\/uploads/,//上传图片
    /^\/api\/category/,//获取商品目录
    /^\/api\/auth\/signInWithEmailAndPassword/,//邮箱密码登录
    /^\/api\/auth\/signInWithPhone/,//手机号登录
    /^\/api\/auth\/createUserIsUsedByPhone/,//查询手机号是否被注册
    /^\/api\/auth\/createUserIsUsedByEmail/,//查询邮箱是否被注册
    /^\/api\/auth\/sendPasswordResetEmail/,//通过邮箱重置密码
    /^\/api\/auth\/createUserWithEmailAndPassword/,//客户注册
    /^\/api\/auth\/createUserWithPhone/,//使用手机注册
    /^\/api\/auth\/resendStringTokenByEmail/,//重发邮件
    /^\/api\/utils/,//图形验证码/获取图片等等
    /^\/web/,/^\/views/,/^\/static/,/^\/api\/user\/updatePasswordByStringtoken/,//web接口
    // /^(?!\/rest\/).*/ // 所有非rest路由
  ]
}
