const fs = require('fs');
const path = require('path');
const util = require('util');

// 创建日志目录
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志文件路径
const logFile = path.join(logDir, 'console.log');

// 创建可写流
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// 时间格式化函数
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

// 保存原始的控制台方法
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

// 重定向控制台输出到文件
console.log = function(...args) {
  const timestamp = getTimestamp();
  const message = util.format(...args);
  logStream.write(`[${timestamp}] INFO: ${message}\n`);
  originalConsole.log.apply(console, args);
};

console.error = function(...args) {
  const timestamp = getTimestamp();
  const message = util.format(...args);
  logStream.write(`[${timestamp}] ERROR: ${message}\n`);
  originalConsole.error.apply(console, args);
};

console.warn = function(...args) {
  const timestamp = getTimestamp();
  const message = util.format(...args);
  logStream.write(`[${timestamp}] WARN: ${message}\n`);
  originalConsole.warn.apply(console, args);
};

console.info = function(...args) {
  const timestamp = getTimestamp();
  const message = util.format(...args);
  logStream.write(`[${timestamp}] INFO: ${message}\n`);
  originalConsole.info.apply(console, args);
};

// 进程退出时关闭日志流
process.on('exit', () => {
  logStream.end();
});

module.exports = {
  logFile
}; 