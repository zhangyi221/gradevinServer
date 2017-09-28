/**
 * 目录顺序表
 * order,数组
 */
var mongoose = require('mongoose');

var CategorySubOrderSchema = mongoose.Schema({
    id: {
        type: Array
    },
    order: {
        type: Array
    }
})
CategorySubOrderSchema.set('collection', 'category_sub_order');

module.exports = mongoose.model("category_sub_order",CategorySubOrderSchema)