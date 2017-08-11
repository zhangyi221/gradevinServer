/**
 * 开发环境
 */

module.exports = {
  port: 3000,
  logging:{
    type: 'dev' // :method :url :status :response-time ms - :res[content-length]
  },
  NODE_ENV: 'development',
  BASE_URI: 'http://ip/api',
  MAX_LOGIN_ATTEMPTS : 5,
  LOCK_TIME : 2 * 60 * 60 * 1000
}
