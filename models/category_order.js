/**
 * 目录顺序表
 * order,数组
 */
var mongoose = require('mongoose');

var CategoryOrderSchema = mongoose.Schema({
    order: {
        type: Array
    }
})
CategoryOrderSchema.set('collection', 'category_order');

module.exports = mongoose.model("category_order",CategoryOrderSchema)