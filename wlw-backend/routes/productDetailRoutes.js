// 产品详情路由模块
const express = require('express');
const ProductDetailController = require('../controllers/productDetailController');

const router = express.Router();

/**
 * @route   GET /product-details/:productId
 * @desc    获取产品详细信息
 * @access  Public
 * @param   productId  产品ID
 */
router.get('/:productId', ProductDetailController.getProductDetail);

module.exports = router; 