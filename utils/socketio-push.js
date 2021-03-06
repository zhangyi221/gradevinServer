var ioe = require('socket.io-emitter')
var redis = require('./redis')
var redisOptions = require('../config/redis')
var socketOptions = require('../config/socketio')
//var ioEmitter = ioe({ host: redisOptions.host, port: redisOptions.port, }, { key: socketOptions.key });
var ioEmitter = ioe(redis.redisClient,{ key: socketOptions.key })
ioEmitter.redis.on('error', onError);
 
function onError(err){
  console.log("ignoring exception: " + err);
}
exports.pushMsgToSingleDevice = function (uid,roomID, msg) {
  console.log('向用户'+uid+'发送状态变化消息' + msg);
  if (roomID == 'user') {
    ioEmitter.to(uid).in(roomID).emit('listen user state', msg);
  }
  
}