var ior = require('socket.io-redis')
var redisOptions = require('../config/redis')
var socketOptions = require('../config/socketio')

module.exports = function (io) {
    var arrAllSocket = {}
    var ioRedis = ior(redisOptions,{ key: socketOptions.key })
    io.adapter(ioRedis);
    io.of('/').adapter.on('error', function(){});
    
    io.on('connection', function (socket) {
        console.log('用户上线')
        var token = socket.handshake.query.token
        var roomID = socket.handshake.query.state//房间ID,这里我们将房间定义为需要监听的状态
        var user_id = ''
        var roomInfo = {}

        socket.on('error', function (exc) {
            console.log("ignoring exception: " + exc);
        });
        socket.on('join', function (_id) {
            this.user_id = _id
            // 将用户昵称加入房间名单中
            if (!roomInfo[roomID]) {
                roomInfo[roomID] = []
            }
            roomInfo[roomID].push(_id)

            socket.join(roomID)    // 加入房间
            //通知房间内人员
            // io.to(roomID).emit('sys', user + '加入了房间', roomInfo[roomID])
            console.log(_id + '加入了' + roomID + '的监听')
            arrAllSocket[this.user_id] = socket
        });

        socket.on('leave', function () {
            socket.emit('disconnect')
        });

        socket.on('disconnect', function () {
            // 从房间名单中移除
            if (this.user_id) {
                console.log('用户从监听房间下线：' + this.user_id)
                var index = roomInfo[roomID].indexOf(this.user_id);
                if (index !== -1) {
                    roomInfo[roomID].splice(index, 1);
                }
                socket.leave(roomID);    // 退出房间
                // io.to(roomID).emit('sys', user + '退出了房间', roomInfo[roomID]);
            }
        });

        // // 接收用户消息,发送相应的房间
        // socket.on('message', function (msg) {
        //     // 验证如果用户不在房间内则不给发送
        //     if (roomInfo[roomID].indexOf(user) === -1) {
        //         return false;
        //     }
        //     io.to(roomID).emit('msg', user, msg);
        // });
    })
}