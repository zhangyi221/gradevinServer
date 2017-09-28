/**
 * 目录表
 * "name",名称 
 * "id", 编号
 * "isSelect",是否被选中 
 * "ad",广告目录
 */
var mongoose = require('mongoose');

var CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    isSelect: {
        type: Boolean,
        required: true
    },
    ad: String
})
CategorySchema.set('collection', 'category');
module.exports = mongoose.model("category",CategorySchema)