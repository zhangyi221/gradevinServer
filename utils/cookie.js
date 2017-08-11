var cookieParser = require('cookie-parser');
var signature = require('cookie-signature');
var cookie = require('cookie')
//作用：用于从请求对象request中获取session ID值，其中name就是我们在options中指定的，首先从req.headers.cookie获取，接着从req.signedCookies中获取，最后从req.cookies获取
exports.getcookie = function (req, name, secrets) {
    var header = req.headers.cookie;
    var raw;
    var val;
    // read from cookie header
    if (header) {
        var cookies = cookie.parse(header);
        raw = cookies[name];
        if (raw) {
            if (raw.substr(0, 2) === 's:') {
                //切割掉前面的字符"s:"!
                val = this.unsigncookie(raw.slice(2), secrets);
                //val表示false意味着客户端传递过来的cookie被篡改了!
                if (val === false) {
                    console.log('cookie signature invalid');

                    val = undefined;
                }
            } else {
                console.log('cookie unsigned')
            }
        }
    }
    // back-compat read from cookieParser() signedCookies data
    if (!val && req.signedCookies) {
        val = req.signedCookies[name];
        if (val) {
            console.log('cookie should be available in req.headers.cookie');
        }
    }

    // back-compat read from cookieParser() cookies data
    if (!val && req.cookies) {
        raw = req.cookies[name];

        if (raw) {
            if (raw.substr(0, 2) === 's:') {
                val = this.unsigncookie(raw.slice(2), secrets);

                if (val) {
                    console.log('cookie should be available in req.headers.cookie');
                }

                if (val === false) {
                    console.log('cookie signature invalid');
                    val = undefined;
                }
            } else {
                console.log('cookie unsigned')
            }
        }
    }

    return val;
}

exports.unsigncookie = function (val, secrets) {
    for (var i = 0; i < secrets.length; i++) {
        var result = signature.unsign(val, secrets[i]);
        if (result !== false) {
            return result;
        }
    }
    return false;
}