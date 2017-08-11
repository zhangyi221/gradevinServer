/**
 * JWT token管理
 */

var jwt = require('jsonwebtoken')
var secretKey = require('../config/secret').token_secret_key

var redis = require('../utils/redis')
var config = require('../config/' + process.env.NODE_ENV)

var secret = new Buffer.from(secretKey, 'base64')

exports.generateToken = function (payload) {
  var token = jwt.sign(payload, secret, { expiresIn: config.TOKEN_EXPIRATION })
  return token
}

exports.verifyToken = function (token) {
  try {
    var payload = jwt.verify(token, secret)
    return payload

  } catch (err) {
    return false
  }
}

exports.decodeToken = function (token) {
  var payload = jwt.decode(token)
  return payload
}

exports.refreshToken = function (token) {
  var payload = this.decodeToken(token)
  // console.dir(payload)
  var token = null
  if (payload) {
    token = jwt.sign({ uid: payload.uid }, secret, { expiresIn: config.TOKEN_EXPIRATION })
  }

  return token
}

exports.getToken = function (req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer [token]
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token
  } else if (req.cookies && req.cookies.token) { // for page
    return req.cookies.token
  }
  return null
}
