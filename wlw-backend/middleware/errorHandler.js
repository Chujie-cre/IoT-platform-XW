// 错误处理中间件模块
/**
 * 全局错误处理中间件
 * @param {Error} err 错误对象
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param {Function} next 下一个中间件函数
 */
function errorHandler(err, req, res, next) {
  console.error('全局错误捕获:', err);
  
  // 记录错误详情
  console.error(err.stack);
  
  // 确定状态码
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  // 构建错误响应
  const errorResponse = {
    success: false,
    message: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    timestamp: new Date().toISOString()
  };
  
  // 发送错误响应
  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler; 