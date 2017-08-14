var _ = require('lodash')
/**
	 * 拷贝对象并返回一个新的对象
	 * @param  {Object} obj 
	 * @return {Object}     
	 */
exports.clone = function (obj) {
    var o, i, j, k;
    if (typeof (obj) != "object" || obj === null) return obj;
    if (obj instanceof (Array)) {
        o = [];
        i = 0; j = obj.length;
        for (; i < j; i++) {
            if (typeof (obj[i]) == "object" && obj[i] != null) {
                o[i] = arguments.callee(obj[i]);
            }
            else {
                o[i] = obj[i];
            }
        }
    }
    else {
        o = {};
        for (i in obj) {
            if (typeof (obj[i]) == "object" && obj[i] != null) {
                o[i] = arguments.callee(obj[i]);
            }
            else {
                o[i] = obj[i];
            }
        }
    }

    return o;
}
/**
 * @see 按照数据的格式转换成默认数据类型
 * @author zhangyi
 * @param {json格式的数据} obj 
 * {
                "name": "xxxxxxxx",
                "password": "111111",
                "auth":
                {
                    "testaa":
                    {
                        "aa": "123123",
                        "bb": "321321"
                    }
                }
            }
 * @return {mongoose数据格式} obj
 * {
                "name": "String",
                "password": "String",
                "auth":
                {
                    "testaa":
                    {
                        "aa": "String",
                        "bb": "String"
                    }
                }
    }
 */
exports.objectToScheam_default = function (obj) {
    for (var obj_sub in obj) {
        if (typeof (obj[obj_sub]) == "object") {
            this.objectToScheam_default(obj[obj_sub])
        } else {
            if (_.isBoolean(obj[obj_sub])) {
                obj[obj_sub] = 'Boolean'
            } else {
                obj[obj_sub] = 'String'
            }
        }
    }
    return obj
}
/**
 * @see 将所有属性值通过eval方法执行,方法直接出结果,字符串转换成function,不影响正常字符串定义
 * @author zhangyi
 * @param {对象} obj 
 * @return {对象} obj 
 */
exports.object_eval = function (obj) {
    for (var obj_sub in obj) {
        if (typeof (obj[obj_sub]) == "object") {
            this.object_eval(obj[obj_sub])
        } else {
            //把值统统转换成方法,方便传递上来的方法执行,不影响字符串
            obj[obj_sub] = eval(obj[obj_sub])
        }
    }
    return obj
}

/**
 * @see 按照客户自定义数据格式进行替换
 * @author zhangyi
 * @param {全部默认为String的数据格式} scheam_type_default 
 * @param {客户自定义的数据格式} scheam_type_custom
*/
exports.objectToScheam_custom = function (scheam_type_default, scheam_type_custom) {

    for (var type_name in scheam_type_custom) {
        //查找被替换的默认格式中是否存在
        if (scheam_type_default[type_name] !== null) {
            //存在
            //判断个性化格式是否有子节点
            if (typeof (scheam_type_custom[type_name]) == "object") {
                //有子节点
                //判断被替换的默认格式此节点有无子节点
                if (typeof (scheam_type_default[type_name]) == "object") {
                    //有子节点,递归本方法
                    this.objectToScheam_custom(scheam_type_default[type_name], scheam_type_custom[type_name])
                } else {
                    //无子节点,直接替换
                    scheam_type_default[type_name] = scheam_type_custom[type_name]
                }
            } else {
                //无子节点
                //直接替换
                scheam_type_default[type_name] = scheam_type_custom[type_name]
            }
        } else {
            //不存在,直接添加（也可不理会）
            scheam_type_default[type_name] = scheam_type_custom[type_name]
        }
    }

    return scheam_type_default
}
/**
 * @see 将一个已知对象转换成a.b.c路径(find条件需要)
 * @see 排除特殊符号$
 * @author zhangyi
 * @param {已知对象a:1,b:{d:2,e:{c,3}}} obj
 * @param {目标对象} p_obj
 * @param {上层位置(a/a.d)} up_postion
 * @return 目标对象
 */
exports.positionObject = function (obj, p_obj, up_postion) {
    for (var obj_sub in obj) {
        //子节点的属性名称是否有操作符$,如果有将此节点作为操作属性不再递归
        var isOptionElement = false
        if (typeof (obj[obj_sub]) == "object") {
            for (var element_name in obj[obj_sub]) {
                if (_.startsWith(element_name, '$')) isOptionElement = true
            }
        }
        //判断是否有子节点
        if (typeof (obj[obj_sub]) == "object" && !isOptionElement) {
            //判断是否存在父节点
            if (!_.isEmpty(up_postion)) {
                //存在,将父节点+此节点作为递归的父节点
                this.positionObject(obj[obj_sub], p_obj, up_postion + '.' + obj_sub)
            } else {
                //不存在,将此节点作为递归的父节点
                this.positionObject(obj[obj_sub], p_obj, obj_sub)
            }

        } else {
            if (!_.isEmpty(up_postion)) {
                var obj_newname = up_postion + '.' + obj_sub
                p_obj[obj_newname] = obj[obj_sub]
            } else {
                p_obj[obj_sub] = obj[obj_sub]
            }
        }
    }
    return p_obj
}

/**
 * @see 将doc的用户信息赋值给session.user
 * @author zhangyi
 * @param {用户信息数据库返回对象} doc
 * @param {请求req} req
 * @return 目标对象
 */
exports.setSessionUserInfo = function (req, doc) {
    var user_obj = {}
    Object.assign(user_obj, {
        _id: doc._id.toString(),
        displayName: doc.displayName,
        email: doc.email,
        phone: doc.phone,
        photoURL: doc.photoURL,
        providerData: doc.providerData,
        isAnonymous: doc.isAnonymous,
        providerId: doc.providerId,
        createDate: doc.createDate,
        updateDate: doc.updateDate,
        isActivate: doc.isActivate,
        active: doc.active
    })
    req.session.user = user_obj
}

/**
 * @see 通过对比图片头来确定文件类型
 * @author zhangyi
 * @param {16进制图片} image_hex
 * @return {png,jpg,other}type
 */
exports.getImageType = function (image_hex) {
    var type = 'other'
    var png_16 = '89504e47'//4字节
    var jpg_16 = 'ffd8ff'//3字节
    var gif_16 = '47494638'//4字节
    var png_base64 = 'iVBORw0KGgoAAAAN'
    var jpg_base64 = '/9j/4AAQSkZJRgAB'

    if (_.startsWith(image_hex,png_16)) type = 'png'
    if (_.startsWith(image_hex,jpg_16)) type = 'jpg'
    if (_.startsWith(image_hex,gif_16)) type = 'gif'
    return type
}