// 路由索引模块
const express = require('express');
const deviceRoutes = require('./devices');
const productRoutes = require('./products');
const logRoutes = require('./logs');
const productDetailRoutes = require('./productDetailRoutes');
const productUpdateRoutes = require('./productUpdateRoutes');
const devicePropertyRoutes = require('./deviceProperties');
const deviceFreezeRoutes = require('./deviceFreezeRoutes');

const router = express.Router();

// 健康检查接口
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: '服务器运行正常',
    config: {
      env: process.env.NODE_ENV || 'development',
      endpoint: process.env.HUAWEICLOUD_ENDPOINT,
    }
  });
});

// 测试路由 - 检查路由系统是否正常工作
router.get('/api/v1/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: '测试路由工作正常'
  });
});

// 测试路由 - 产品更新测试
router.put('/api/v1/test-update', (req, res) => {
  res.status(200).json({
    success: true,
    message: '测试更新路由工作正常',
    body: req.body,
    query: req.query
  });
});

// API接口版本化
router.use('/api/v1/devices', deviceRoutes);
router.use('/api/v1/products', productRoutes);
router.use('/api/v1/product-details', productDetailRoutes);
router.use('/api/v1/product-update', productUpdateRoutes);
router.use('/api/v1/logs', logRoutes);
router.use('/api/v1/device-properties', devicePropertyRoutes);
router.use('/api/v1/device-freeze', deviceFreezeRoutes);

// 兼容旧路径 - 删除这些重复的路由，统一使用API版本化路由
// router.use('/devices', deviceRoutes);
// router.use('/products', productRoutes);
// router.use('/logs', logRoutes);

module.exports = router; 