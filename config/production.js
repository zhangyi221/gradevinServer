/**
 * 生产环境
 */

module.exports = {
  port: 80,
  logging: {
    type: 'combined' // Standard Apache combined log output
  },
  NODE_ENV: 'production',
  BASE_URI: 'http://ip/api',
  MAX_LOGIN_ATTEMPTS : 5,
  LOCK_TIME : 2 * 60 * 60 * 1000
}
