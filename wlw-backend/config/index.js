// 配置模块
require('dotenv').config();

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'device-id']
    }
  },
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iot_platform'
  },
  
  // 华为云IoT平台配置
  huaweiCloud: {
    ak: process.env.HUAWEICLOUD_SDK_AK,
    sk: process.env.HUAWEICLOUD_SDK_SK,
    projectId: process.env.HUAWEICLOUD_PROJECT_ID,
    endpoint: process.env.HUAWEICLOUD_ENDPOINT,
    regionId: process.env.HUAWEICLOUD_REGION_ID
  }
}; 