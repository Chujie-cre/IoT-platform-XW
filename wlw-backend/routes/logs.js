// 日志路由模块
const express = require('express');
const LogController = require('../controllers/logController');

const router = express.Router();

/**
 * @route   GET /logs
 * @desc    获取系统日志
 * @access  Public
 * @query   limit  限制返回的日志条数 (可选)
 * @query   level  过滤日志级别 (可选: info, warn, error, debug)
 */
router.get('/', LogController.getLogs);

/**
 * @route   DELETE /logs
 * @desc    清空系统日志
 * @access  Public
 */
router.delete('/', LogController.clearLogs);

module.exports = router; 