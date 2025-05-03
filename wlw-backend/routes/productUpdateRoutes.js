// 产品更新路由模块
const express = require('express');
const ProductUpdateController = require('../controllers/productUpdateController');

const router = express.Router();

/**
 * @route   PUT /product-update
 * @desc    更新产品信息
 * @access  Public
 * @query   productId 产品ID
 * @body    name              产品名称
 * @body    device_type       设备类型
 * @body    protocol_type     协议类型
 * @body    data_format       数据格式
 * @body    manufacturer_name 厂商名称
 * @body    industry          行业
 * @body    description       产品描述
 */
router.put('/', ProductUpdateController.updateProduct);

module.exports = router; 