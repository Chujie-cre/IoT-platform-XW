// 设备路由模块
const express = require('express');
const DeviceController = require('../controllers/deviceController');

const router = express.Router();

/**
 * @route   GET /devices
 * @desc    获取所有设备列表
 * @access  Public
 * @query   refresh  是否从云端刷新设备列表 (true/false)
 */
router.get('/', DeviceController.getAllDevices);

/**
 * @route   GET /devices/:deviceId
 * @desc    获取单个设备详情
 * @access  Public
 * @param   deviceId  设备ID
 */
router.get('/:deviceId', DeviceController.getDeviceById);

/**
 * @route   POST /devices
 * @desc    创建新设备
 * @access  Public
 * @body    device_name        设备名称 (必填)
 * @body    product_id  产品ID (必填)
 * @body    node_id     节点ID (可选)
 */
router.post('/', DeviceController.createDevice);

/**
 * @route   PUT /devices/:deviceId
 * @desc    更新设备信息
 * @access  Public
 * @param   deviceId    设备ID
 * @body    device_name        设备名称 (可选)
 * @body    product_id  产品ID (可选)
 * @body    status      设备状态 (可选)
 */
router.put('/:deviceId', DeviceController.updateDevice);

/**
 * @route   DELETE /devices/:deviceId
 * @desc    删除设备
 * @access  Public
 * @param   deviceId    设备ID
 */
router.delete('/:deviceId', DeviceController.deleteDevice);

module.exports = router; 