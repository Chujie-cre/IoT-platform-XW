// 日志控制器模块
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * 日志控制器类，处理系统日志相关的请求
 */
class LogController {
  /**
   * 获取终端日志
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getLogs(req, res) {
    try {
      const platform = os.platform();
      const isWindows = platform === 'win32';
      
      // 创建日志目录（如果不存在）
      const logDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      if (isWindows) {
        // Windows环境下，直接读取日志文件
        const logFile = path.join(logDir, 'console.log');
        
        // 确保日志文件存在
        if (!fs.existsSync(logFile)) {
          fs.writeFileSync(logFile, '系统启动\n', 'utf8');
        }
        
        // 读取日志文件
        const data = fs.readFileSync(logFile, 'utf8');
        const lines = data.split('\n').filter(line => line.trim()).slice(-200);
        
        return res.status(200).json({
          success: true,
          logs: lines
        });
      } else {
        // Linux/Mac环境下，使用tail命令
        exec('tail -n 200 logs/console.log 2>/dev/null || echo "暂无日志"', (error, stdout) => {
          const lines = stdout.split('\n').filter(line => line.trim());
          
          return res.status(200).json({
            success: true,
            logs: lines
          });
        });
      }
    } catch (error) {
      console.error('获取终端日志失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '获取终端日志失败',
        error: error.message
      });
    }
  }
  
  /**
   * 清空日志
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async clearLogs(req, res) {
    try {
      const logFile = path.join(__dirname, '../logs/console.log');
      
      // 清空日志文件
      fs.writeFileSync(logFile, '', 'utf8');
      
      return res.status(200).json({
        success: true,
        message: '日志已清空'
      });
    } catch (error) {
      console.error('清空日志失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '清空日志失败',
        error: error.message
      });
    }
  }
}

module.exports = LogController; 