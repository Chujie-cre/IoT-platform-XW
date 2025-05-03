// 设备属性路由模块
const express = require('express');
const DevicePropertyController = require('../controllers/devicePropertyController');

const router = express.Router();

/**
 * @route   GET /device-properties/:deviceId
 * @desc    获取设备属性值
 * @access  Public
 * @param   deviceId    设备ID
 * @query   serviceId   服务ID (可选)
 */
router.get('/:deviceId', DevicePropertyController.getDeviceProperties);

module.exports = router; 