/**
 * MongoDB
 */

var config = require('../config/mongodb')
var Promise = require('bluebird')
var mongoose_temp = require('mongoose')
//mongoose_temp.Promise = global.Promise
var mongoose = Promise.promisifyAll(mongoose_temp)


var uri = 'mongodb://' + config.username + ':' + config.userpassword + '@' + config.host + ':' + config.port + '/' + config.database

exports.Mongo = function () {
	mongoose
		.connect(uri, config.options)
		.connection
		.on('error', err => console.log('[mongoose] Error connecting to: ' + uri + '. ' + err))
		.on('open', () => console.log('[mongoose] Successfully connected to: ' + uri))

	console.log('数据库初始化成功');
}
