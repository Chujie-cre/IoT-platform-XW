const express = require('express');
const router = express.Router();
const { freezeDevice, unfreezeDevice } = require('../controllers/deviceFreezeController');

// 冻结设备
router.post('/', freezeDevice);

// 解冻设备
router.delete('/', unfreezeDevice);

module.exports = router; 