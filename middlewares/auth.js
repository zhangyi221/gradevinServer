/**
 * JWT认证中间件
 */
var jwt = require('express-jwt')
var secret = require('../config/secret').token_secret_key
var tokenUtil = require('../utils/token')

var config = require('../config/' + process.env.NODE_ENV)

module.exports = jwt({
  secret: new Buffer(secret, 'base64'),
  requestProperty: 'user', // By default, the decoded token is attached to req.user
  credentialsRequired: true, // You might want to use this module to identify registered users while still providing access to unregistered users
  getToken: tokenUtil.getToken // Where the token is
}).unless({ // 排除路径
  path: config.unlesspath
})
