/**
 * Redis 缓存
 */

var redis = require('redis')
var redisOptions = require('../config/redis')

var redisClient = redis.createClient(redisOptions)

redisClient.on('error', function (err) {
  console.log('Error ' + err)
})

redisClient.on('connect', function () {
  console.log('Redis初始化链接完毕')
})

exports.redis = redis
exports.redisClient = redisClient
