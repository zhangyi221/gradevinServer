
var mongoose = require('mongoose');
var _ = require('lodash');
var util = require('../utils/util')
/**
 * @see 动态生成Model
 * @see 默认支持String\Boolean
 * @see 可根据document_type来自定义其他数据类型,需要与data内路径一致(参照mogoose Schema)
 * @see 自动添加created_at,updated_at
 * @author zhangyi
 * @param {文档名称} req.body.document
 * @param {操作类型 save/update/find/} req.body.operation
 * @param {自定义数据类型(已测试Boolean,Date)} req.body.document_type
 * @param {数据} req.body.data
 * @param {查询条件} req.body.find
 * @param {更新数据} req.body.update
 * @return {model} mongoose.model
 插入数据例子
{
  "document": "testabc",
  "operation": "save",
  "document_type": {
    "name": {
      "type": "String",
      "index": true
    },
    "email": {
      "type": "String",
      "index": {
        "unique": true
      }
    },
    "auth": {
      "testaa": {
        "aa": {
          "type": "Date",
          "default": "Date.now()"
        }
      }
    }
  },
  "data": {
    "name": "testname1",
    "email": "2222@2222.com",
    "password": "111111",
    "auth": {
      "role": false,
      "father": "supper",
      "testaa": {
        "bb": "321321"
      }
    }
  }
}
更新数据例子
{
    "document": "testabc",
    "operation": "update",
    "find": {
        "email": "111@111.com",
        "auth": {
            "role": false,
            "testaa": {
                "bb": "321321"
            }
        }
    },
    "update": {
        "name": "testname2"
    }
}
删除数据例子
{
    "document": "testabc",
    "operation": "delete",
    "find": {
        "name": "testname12",
        "auth": {
            "testaa": {
                "bb": {
                "$lt" : "321321"
                }
            }
        }
    },
}
*/

exports.generateModel = function (req) {
    //document名称
    var document_path = req.body.document
    //数据库操作类型
    var document_operation = req.body.operation
    //document数据
    var document_data = req.body.data
    //自定义数据格式
    var scheam_type_custom = req.body.document_type
    //find数据
    var document_find = req.body.find
    //update数据
    var document_update = req.body.update
    //对象合并,用于生成更新数据的数据模型
    var document_merge = _.merge(util.clone(document_update), util.clone(document_find))
    // console.log('document名称 = ' , document_path)
    // console.log('数据find = ' , document_find)
    // console.log('数据update = ' , document_update)
    // console.log('数据 = ' , document_data)
    // console.log('自定义类型 = ' , scheam_type_custom)
    //判断数据库操作类型,来生成对用的基础数据类型
    var scheam_type
    switch (document_operation) {
        case 'save':
            scheam_type = util.objectToScheam_default(util.clone(document_data))
            break
        case 'update':
            scheam_type = util.objectToScheam_default(document_merge)
            break
        case 'delete':
            scheam_type = util.objectToScheam_default(util.clone(document_find))
            break
        default:
            return null
    }

    // console.log('默认类型 = ' , scheam_type)
    if (typeof (scheam_type_custom) == "object") {
        //自定义数据结构
        //替换默认数据类型
        scheam_type = util.objectToScheam_custom(scheam_type, scheam_type_custom)
    }
    //属性值全部更新为function XXXX
    scheam_type = util.object_eval(scheam_type)
    // console.log('最终结果 = ' , scheam_type)
    
    var Schema = mongoose.Schema(scheam_type,{ collection: document_path})
    Schema.add({ updated_at: Date, created_at: Date })
    
    Schema.pre('save', function (next) {
        var currentDate = Date.now();
        this.updated_at = currentDate;
        if (!this.created_at) {
            this.created_at = currentDate;
        }
        next();
    });
    return mongoose.model(document_path, Schema);
}