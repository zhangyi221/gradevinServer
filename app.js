var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var config = require('./package.json')
var cookieParser = require('cookie-parser');
var secretKey = require('./config/secret')
var bodyParser = require('body-parser');
var session = require('express-session');
//mongodb
var mongodb = require('./utils/mongodb')
mongodb.Mongo()
//session-redis
var RedisStore = require('connect-redis')(session)
var redis = require('./utils/redis')
var sessionStore = new RedisStore({client: redis.redisClient})
//创建上传目录
var makeDir = require('make-dir')
makeDir('public/uploads/avatars/')
//初始化错误码表
var errorcode = require('./utils/error_code');
errorcode.Init();
//var logger = require('morgan');
//自定义logger
var logger = require('./middlewares/logger');
//自定义封装的API
var resApi = require('./middlewares/api')
//auth认证 jwt
var authorization = require('./middlewares/auth')
//拦截器
var interceptor = require('./middlewares/interceptor')
//根据路径来自动加载路由
var mountRoutes = require('mount-routes')
var cors = require('cors');//跨域

//新建replacall
String.prototype.replaceAll = function (oldStr, newStr) {
  return this.split(oldStr).join(newStr);
}

require('./utils/hbs') // init hbs

var app = express();
// view engine setup///=======模板 开始===========//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
///=======模板 结束===========//

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//app.use(logger('dev'));
/*-------------跨域设置-------------*/
app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        res.header('Access-Control-Allow-Credentials', true)
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next()
});
app.use(logger)
app.use(resApi)
app.use(authorization)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//设置cookie
app.use(cookieParser(secretKey.token_secret_key))
//设置redis session
app.use(session({
  name : "jsessionid",
  store: sessionStore,
  cookie: {
    maxAge: 60000*60*24,//一分钟*60*24
  },
  resave: true,
  rolling:true,
  saveUninitialized: false,
  secret: secretKey.token_secret_key
}))

// var corsOptions = {
//   origin : 'http://localhost:8100',
//   credentials: true,
//   optionsSuccessStatus: 200
// }
// app.use(cors(corsOptions))
/*-------------跨域设置-------------*/

//拦截器(处理session)
var unless = require('express-unless')
var server_config = require('./config/' + process.env.NODE_ENV)
interceptor.unless = unless
app.use(interceptor.unless({ // 排除路径
  path: server_config.unlesspath
}))

app.use(express.static(path.join(__dirname, 'public')))
// appnpm start
mountRoutes(app, path.join(__dirname, 'routes'), false)

// set resouces root url
app.locals.resoucePath = '/static'
// set resouces version
app.locals.resouceVersion = config.version
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
// catch unauthorized error and other forward to error handler
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.api_error({
      code: -1,
      msg: 'Invalid Token'
      //msg: 'Invalid Token' + '[' + err.message + ']'
    })
  } else {
    next(err)
  }
})
// error handler
// no stacktraces leaked to user for production,
// and will print stacktrace for development
app.use(function (err, req, res, next) {
  return res.api_error({
    msg: err.message,
    code: app.get('env') === 'development' ? err : {}
  })
})

module.exports = app;
