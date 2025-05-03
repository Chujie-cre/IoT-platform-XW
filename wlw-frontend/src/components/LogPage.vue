<template>
  <div class="log-container">
    <h2>系统终端日志</h2>
    <div class="log-controls">
      <button @click="refreshLogs" class="refresh-btn" :disabled="loading">
        {{ loading ? '加载中...' : '刷新日志' }}
      </button>
      <button @click="clearLogs" class="clear-btn" :disabled="loading">清空日志</button>
      <label class="auto-refresh-label">
        <input type="checkbox" v-model="autoRefresh"> 自动刷新
      </label>
      <label class="timestamp-label">
        <input type="checkbox" v-model="showTimestamp"> 显示时间戳
      </label>
      <button @click="scrollToBottom" class="scroll-btn">滚动到底部</button>
    </div>
    
    <div class="terminal">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="terminal-button red"></span>
          <span class="terminal-button yellow"></span>
          <span class="terminal-button green"></span>
        </div>
        <div class="terminal-title">系统日志终端</div>
        <div class="terminal-status">{{loading ? '正在加载...' : '空闲'}}</div>
      </div>
      <div class="logs-display" ref="logsDisplay">
        <div v-if="logs.length" class="log-content">
          <div v-for="(log, index) in logs" :key="index" class="log-line" v-html="formatLog(log)"></div>
        </div>
        <p v-else>暂无日志</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LogPage',
  data() {
    return {
      logs: [],
      loading: false,
      autoRefresh: false,
      refreshInterval: null,
      showTimestamp: true
    }
  },
  mounted() {
    this.refreshLogs();
    // 添加滚动监听
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    this.stopAutoRefresh();
    // 移除滚动监听
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    autoRefresh(newValue) {
      if (newValue) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
    logs() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  },
  methods: {
    async refreshLogs() {
      this.loading = true;
      
      try {
        const response = await axios.get('/api/logs');
        if (response.data.success) {
          this.logs = response.data.logs || [];
        } else {
          console.error('获取日志失败:', response.data.message);
        }
      } catch (error) {
        console.error('获取日志错误:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async clearLogs() {
      if (!confirm('确定要清空日志吗？')) return;
      
      this.loading = true;
      
      try {
        const response = await axios.delete('/api/logs');
        if (response.data.success) {
          this.logs = [];
          alert('日志已清空');
        } else {
          alert('清空日志失败: ' + response.data.message);
        }
      } catch (error) {
        console.error('清空日志错误:', error);
        alert('清空日志失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.refreshLogs();
      }, 5000); // 每5秒刷新一次
    },
    
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },
    
    handleResize() {
      // 窗口大小变化时重新滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.logsDisplay) {
          // 使用setTimeout确保DOM完全更新
          setTimeout(() => {
            this.$refs.logsDisplay.scrollTop = this.$refs.logsDisplay.scrollHeight;
          }, 50);
        }
      });
    },
    
    toggleTimestamp() {
      this.showTimestamp = !this.showTimestamp;
    },
    
    formatLog(log) {
      // 检测日志级别并添加相应的样式
      let logClass = '';
      if (log.includes('ERROR') || log.includes('错误')) {
        logClass = 'error';
      } else if (log.includes('WARN') || log.includes('警告')) {
        logClass = 'warning';
      } else if (log.includes('INFO') || log.includes('信息')) {
        logClass = 'info';
      } else if (log.includes('DEBUG') || log.includes('调试')) {
        logClass = 'debug';
      }
      
      let formattedLog = log;
      
      // 处理时间戳
      if (this.showTimestamp) {
        const timestampRegex = /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})/;
        const match = log.match(timestampRegex);
        
        if (match) {
          const timestamp = match[1];
          const formattedTime = timestamp.replace('T', ' ').substring(0, 19);
          formattedLog = log.replace(timestamp, `[${formattedTime}]`);
        }
      }
      
      // 确保特殊字符被转义，防止破坏HTML结构
      formattedLog = formattedLog
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      return `<span class="${logClass}">${formattedLog}</span>`;
    }
  }
}
</script>

<style>
/* 全局样式，确保页面可滚动 */
html, body, #app, #app > div {
  height: auto !important;
  min-height: 100%;
  overflow-y: auto !important;
  position: relative;
}

/* 移除日志页面的滚动限制 */
body.logs-page {
  overflow: auto !important;
  height: auto !important;
}

body.logs-page .app-content {
  overflow: auto !important;
  height: auto !important;
}
</style>

<style scoped>
.log-container {
  padding: 1rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.log-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.refresh-btn, .clear-btn, .scroll-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.refresh-btn {
  background-color: #1890ff;
  color: white;
}

.refresh-btn:hover {
  background-color: #40a9ff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #ff4d4f;
  color: white;
}

.clear-btn:hover {
  background-color: #ff7875;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.clear-btn:disabled {
  background-color: #ffccc7;
  cursor: not-allowed;
}

.scroll-btn {
  background-color: #52c41a;
  color: white;
}

.scroll-btn:hover {
  background-color: #73d13d;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.auto-refresh-label, .timestamp-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.terminal {
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  border: 1px solid #333;
  height: 500px; /* 默认高度 */
}

@media (min-height: 900px) {
  .terminal {
    height: 600px; /* 大屏幕上的高度 */
  }
}

@media (max-height: 768px) {
  .terminal {
    height: 400px; /* 小屏幕上的高度 */
  }
}

.terminal-header {
  background-color: #2a2a2a;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 36px;
  border-bottom: 1px solid #333;
}

.terminal-buttons {
  display: flex;
  gap: 0.5rem;
}

.terminal-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  border: 1px solid #c44;
}

.terminal-button.yellow {
  background-color: #ffbd2e;
  border-color: #e09e44;
}

.terminal-button.green {
  background-color: #27c93f;
  border-color: #1aab29;
}

.terminal-title {
  flex-grow: 1;
  font-size: 0.9rem;
  color: #ddd;
  text-align: center;
}

.terminal-status {
  font-size: 0.8rem;
  color: #888;
  width: 100px;
  text-align: right;
}

.logs-display {
  background-color: #1e1e1e;
  color: #ddd;
  padding: 1rem;
  flex: 1;
  height: calc(100% - 36px);
  overflow-y: scroll; /* 始终显示滚动条 */
  overflow-x: hidden;
  font-family: 'Consolas', 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  position: relative;
  word-break: break-all; /* 确保长文本可以换行 */
}

.logs-display:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(to bottom, #1e1e1e, transparent);
  z-index: 1;
  pointer-events: none;
}

.logs-display:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(to top, #1e1e1e, transparent);
  z-index: 1;
  pointer-events: none;
}

/* 自定义滚动条样式 */
.logs-display::-webkit-scrollbar {
  width: 8px;
}

.logs-display::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.logs-display::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.logs-display::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.logs-display pre {
  margin: 0;
  width: 100%;
  display: block;
}

.logs-display p {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
}

.log-content {
  width: 100%;
}

.log-line {
  display: block;
  line-height: 1.5;
  padding: 2px 0;
  width: 100%;
  min-height: 1.5em; /* 确保即使是空行也有高度 */
  margin-bottom: 2px; /* 为每行增加一点底部间距 */
}

.log-line:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* 日志高亮颜色 */
.logs-display .error {
  color: #ff6b6b;
}

.logs-display .warning {
  color: #feca57;
}

.logs-display .info {
  color: #1dd1a1;
}

.logs-display .debug {
  color: #54a0ff;
}

@media (max-width: 768px) {
  .log-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .terminal {
    height: 400px; /* 移动设备上使用较小的固定高度 */
  }
  
  .logs-display {
    height: calc(100% - 36px);
  }
}
</style> 