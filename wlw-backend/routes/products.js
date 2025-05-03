// 产品路由模块
const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

/**
 * @route   GET /products
 * @desc    获取所有产品列表
 * @access  Public
 * @query   refresh  是否从云端刷新产品列表 (true/false)
 */
router.get('/', ProductController.getAllProducts);

/**
 * @route   GET /products/:productId
 * @desc    获取单个产品详情
 * @access  Public
 * @param   productId  产品ID
 */
router.get('/:productId', ProductController.getProductById);

/**
 * @route   POST /products
 * @desc    创建新产品
 * @access  Public
 * @body    name               产品名称 (必填)
 * @body    device_type        设备类型 (可选, 默认WaterMeter)
 * @body    protocol_type      协议类型 (可选, 默认MQTT)
 * @body    data_format        数据格式 (可选, 默认JSON)
 * @body    manufacturer_name  厂商名称 (可选, 默认"默认厂商")
 * @body    industry           所属行业 (可选, 默认WaterConservancy)
 * @body    description        产品描述 (可选)
 */
router.post('/', ProductController.createProduct);

/**
 * @route   PUT /products/:productId
 * @desc    更新产品信息
 * @access  Public
 * @param   productId          产品ID
 * @body    name               产品名称 (可选)
 * @body    device_type        设备类型 (可选)
 * @body    manufacturer_name  厂商名称 (可选)
 * @body    description        产品描述 (可选)
 */
router.put('/:productId', ProductController.updateProduct);

/**
 * @route   DELETE /products/:productId
 * @desc    删除产品
 * @access  Public
 * @param   productId          产品ID
 */
router.delete('/:productId', ProductController.deleteProduct);

module.exports = router; 