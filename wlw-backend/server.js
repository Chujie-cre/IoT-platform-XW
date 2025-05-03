// 服务器入口文件
require('dotenv').config();
// 引入日志工具，将控制台输出重定向到文件
require('./utils/logger');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { initDatabase } = require('./utils/database');

// 创建Express应用
const app = express();

// 设置安全模式（实际环境请设置为1）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_ENV === 'development' ? '0' : '1';

// 中间件配置
app.use(cors(config.server.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 路由
app.use('/', routes);

// 错误处理
app.use(errorHandler);

// 处理404错误
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    path: req.originalUrl
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    
    // 启动服务器
    const PORT = config.server.port;
    
    app.listen(PORT, () => {
      console.log(`
=================================================
          ✨🎀小窝物联网平台💎♥
  IoT平台后端服务已启动，正在监听端口: ${PORT}
  环境: ${config.server.env}
  华为云端点: ${config.huaweiCloud.endpoint}
  API: http://localhost:${PORT}/api/v1
  健康检查: http://localhost:${PORT}/health
=================================================
      `);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer(); 