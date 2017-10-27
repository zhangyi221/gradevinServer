var code = require('../utils/error_code')
var config = require('../config/' + process.env.NODE_ENV)
var Category = require('../models/category')
var CategoryOrder = require('../models/category_order')
var CategorySub = require('../models/category_sub')
var CategorySubOrder = require('../models/category_sub_order')
var _ = require('lodash')

/**
 * 获取有顺序的的类别表
 */
exports.getCategory = async function (req, res) {
	try {
		let doc_category = await Category.aggregate([
			// stage 1: join subcategories
			{
				$lookup: {
					from: 'ad',      // collection to join
					localField: 'ad',          // field from categories collection
					foreignField: 'path', // field from subcategories collection
					as: 'ad'
				}
				// $lookup: {
				// 	from: 'category_sub',      // collection to join
				// 	localField: 'id',          // field from categories collection
				// 	foreignField: 'upid', // field from subcategories collection
				// 	as: 'category_sub'           
				// }
			},
			{
				$lookup: {
					from: 'category_sub',      // collection to join
					localField: 'id',          // field from categories collection
					foreignField: 'upid', // field from subcategories collection
					as: 'sub'
				}
			},
			{
				$project: {
					ad: { "_id": 0 },
					sub: { "_id": 0 },
					_id: 0
				}
			}
		]).exec()
		let doc_category_order = await CategoryOrder.findOneAsync()
		if (doc_category_order && doc_category_order.order) {
			//排序
			let category_sort = []
			category_sort = categoryOrder(doc_category, doc_category_order)
			//子类别排序
			let doc_category_sub_order = await CategorySubOrder.findAsync()
			for (let i = 0; i < category_sort.length; i++) {
				let category_sub_order_id = _.findIndex(doc_category_sub_order, { 'id': category_sort[i].id })
				//如果子类别有排序数组
				if (category_sub_order_id >= 0) {
					//对当前对象子类别对象进行排序
					let doc_category_sub_sort = categoryOrder(category_sort[i].sub, doc_category_sub_order[category_sub_order_id])
					category_sort[i].sub = doc_category_sub_sort
				}
			}
			return res.api(category_sort, { code: 0, msg: '交易成功' })
		} else {
			return res.api(doc_category, { code: 0, msg: '交易成功' })
		}
	} catch (err) {
		return res.api_error({ code: 99999, msg: err.message })
	}
}
function categoryOrder(doc_category, doc_category_order) {
	let category_sort = []
	for (let i = 0; i < doc_category_order.order.length; i++) {
		let order = doc_category_order.order[i]//当前顺序编号
		let id = _.findIndex(doc_category, { 'id': order })
		if (id >= 0) {
			category_sort.push(doc_category[id])
			doc_category.splice(id, 1)//删除数组l位置起1个元素
		}
	}
	return category_sort
}
/**
 * 获取子类别
 */
exports.getSubCategory = async function (req, res) {
	var category_id = req.query.id
	try {
		let doc_category = await CategorySub.findAsync({ upid: category_id }, '-_id')
		let doc_category_order = await CategorySubOrder.findOneAsync({ id: category_id }, '-_id')
		if (doc_category_order && doc_category_order.order) {
			//排序
			let category_sort = []
			category_sort = categoryOrder(doc_category, doc_category_order)
			return res.api(category_sort, { code: 0, msg: '交易成功' })
		} else {
			return res.api(doc_category, { code: 0, msg: '交易成功' })
		}
	} catch (err) {
		return res.api_error({ code: 99999, msg: err.message })
	}
}