/**
 * 子目录表
 * "name",名称 
 * "id", 父编号
 * "subid",编号 
 * "scr",图标地址
 */
var mongoose = require('mongoose');

var CategorySubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    upid: {
        type: String,
        required: true
    },
    src: String
})
CategorySubSchema.set('collection', 'category_sub');
module.exports = mongoose.model("category_sub",CategorySubSchema)