<template>
  <div class="after-sales-container">

    <div class="service-section">
      <div class="chat-container">
        <div class="chat-header">
          <div class="status-indicator online"></div>
          <h2>在线客服</h2>
          <span class="response-time">平均响应时间: 1分钟</span>
        </div>
        
        <div class="chat-messages" ref="chatMessages">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
            <div class="message-avatar">
              <img src="/avatar/avatar.png" :alt="message.sender">
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.sender }}</span>
                <span class="message-time">{{ message.time }}</span>
              </div>
              <div class="message-text" v-html="message.text"></div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <textarea 
            v-model="newMessage" 
            @keyup.enter="sendMessage" 
            placeholder="请输入您的问题..."
            rows="3"
          ></textarea>
          <div class="input-actions">
            <button class="btn-attach">
              <span class="icon">📎</span>
              <span class="text">附件</span>
            </button>
            <button class="btn-send" @click="sendMessage" :disabled="!newMessage.trim()">
              <span class="icon">📤</span>
              <span class="text">发送</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="faq-section">
        <h2>常见问题</h2>
        <div class="faq-list">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index" 
            class="faq-item"
            @click="selectFaq(faq)"
          >
            <div class="faq-question">{{ faq.question }}</div>
            <div class="faq-preview">{{ faq.answer.substring(0, 50) }}...</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="contact-section">
      <h2>其他联系方式</h2>
      <div class="contact-methods">
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <div class="contact-info">
            <h3>客服热线</h3>
            <p>18985500792</p>
            <p class="note">工作时间：周一至周五 9:00-18:00</p>
          </div>
        </div>
        
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <div class="contact-info">
            <h3>电子邮件</h3>
            <p>2425739349@qq.com</p>
            <p class="note">通常24小时内回复</p>
          </div>
        </div>
        
        <div class="contact-item">
          <span class="contact-icon">💬</span>
          <div class="contact-info">
            <h3>微信公众号</h3>
            <p>扫描下方二维码</p>
            <div class="qrcode-placeholder">
              <img src="hero-image.png" alt="">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AfterSalesPage',
  data() {
    return {
      newMessage: '',
      messages: [
        {
          type: 'system',
          sender: '系统',
          text: '欢迎来到售后服务中心，请问有什么可以帮助您的？',
          time: this.formatTime(new Date()),
          avatar: '/avatar-system.png'
        },
        {
          type: 'assistant',
          sender: '客服小窝',
          text: '您好！我是智能客服小窝，很高兴为您服务。您可以直接提问，或者从右侧选择常见问题。',
          time: this.formatTime(new Date()),
          avatar: '/avatar-assistant.png'
        }
      ],
      faqs: [
        {
          question: '如何连接设备到平台？',
          answer: '要将设备连接到平台，请先在"产品管理"中创建产品，然后在"设备管理"中添加设备。添加后，您将获得设备连接所需的认证信息。按照设备说明书上的指引，输入这些信息到设备中即可完成连接。'
        },
        {
          question: '设备无法上线怎么办？',
          answer: '设备无法上线可能有多种原因：1. 检查设备是否通电；2. 确认WiFi连接是否正常；3. 确认设备ID和密钥是否正确；4. 检查设备固件是否最新；5. 尝试重置设备并重新配网。如问题持续，请提供设备型号和日志，我们将进一步协助您解决。'
        },
        {
          question: '如何更新设备固件？',
          answer: '更新设备固件有两种方式：1. OTA远程更新：在设备管理页面选择设备，点击"固件更新"，上传新固件并发起更新任务；2. 本地更新：下载固件到本地，按照设备说明书指引，使用配套工具进行更新。请确保更新过程中设备电量充足，不要中断更新过程。'
        },
        {
          question: '设备数据异常怎么排查？',
          answer: '设备数据异常排查步骤：1. 查看设备日志，确认数据采集和上报是否正常；2. 检查设备传感器是否工作正常；3. 验证数据模型是否正确配置；4. 确认网络连接稳定性；5. 尝试重启设备。如需进一步帮助，请提供具体的异常数据和设备型号，我们的技术团队将为您分析。'
        },
        {
          question: '如何申请退换货？',
          answer: '申请退换货流程：1. 登录您的账户；2. 进入"订单管理"，找到相应订单；3. 点击"申请售后"按钮；4. 选择"退货"或"换货"，填写原因和描述；5. 上传产品问题照片；6. 提交申请后，客服将在1-2个工作日内联系您，并安排后续处理。请注意，产品需在保修期内且保持完好包装。'
        }
      ]
    }
  },
  methods: {
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      // 添加用户消息
      this.messages.push({
        type: 'user',
        sender: '我',
        text: this.newMessage,
        time: this.formatTime(new Date()),
        avatar: '/avatar-user.png'
      });
      
      const userQuestion = this.newMessage;
      this.newMessage = '';
      
      // 自动滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 模拟客服回复
      setTimeout(() => {
        this.messages.push({
          type: 'assistant',
          sender: '客服小窝',
          text: this.generateResponse(userQuestion),
          time: this.formatTime(new Date()),
          avatar: '/avatar-assistant.png'
        });
        
        // 再次滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 1000);
    },
    
    selectFaq(faq) {
      // 添加用户消息（问题）
      this.messages.push({
        type: 'user',
        sender: '我',
        text: faq.question,
        time: this.formatTime(new Date()),
        avatar: '/avatar-user.png'
      });
      
      // 自动滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 模拟客服回复（答案）
      setTimeout(() => {
        this.messages.push({
          type: 'assistant',
          sender: '客服小窝',
          text: faq.answer,
          time: this.formatTime(new Date()),
          avatar: '/avatar-assistant.png'
        });
        
        // 再次滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 500);
    },
    
    formatTime(date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    scrollToBottom() {
      const container = this.$refs.chatMessages;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    
    generateResponse(question) {
      // 简单的关键词匹配，实际应用中可以使用更复杂的算法或API
      const keywords = [
        { key: ['连接', '配对', '配网'], response: '要连接设备，请确保您的设备已开机并处于配对模式。然后在"设备管理"中点击"添加设备"，按照向导完成设备连接。' },
        { key: ['固件', '更新', '升级'], response: '您可以在设备详情页面的"固件管理"选项卡中查看当前固件版本并进行更新。我们建议始终保持最新的固件版本以获得最佳性能和安全性。' },
        { key: ['离线', '断开', '连不上'], response: '设备离线可能是由于网络问题、电源问题或设备故障。请尝试重启设备，检查网络连接，并确保设备在信号覆盖范围内。' },
        { key: ['数据', '报表', '统计'], response: '您可以在设备详情页面的"数据分析"选项卡中查看设备的历史数据和统计报表。支持按天、周、月进行数据筛选和导出。' },
        { key: ['退货', '换货', '退款'], response: '如需申请退换货，请在"订单管理"中找到相应订单，点击"申请售后"按钮，按照提示完成申请。我们的客服团队将在1-2个工作日内处理您的请求。' }
      ];
      
      // 检查问题是否包含关键词
      for (const item of keywords) {
        if (item.key.some(k => question.includes(k))) {
          return item.response;
        }
      }
      
      // 默认回复
      return '感谢您的咨询。您的问题可能需要更专业的技术支持，我们的团队将进一步处理。您也可以拨打客服热线18985500792获取即时帮助。';
    }
  },
  mounted() {
    // 初始滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  }
}
</script>

<style scoped>
.after-sales-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
}

.service-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.chat-container {
  flex: 2;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 600px;
}

.chat-header {
  background: var(--primary-color);
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4caf50;
  position: relative;
}

.status-indicator.online::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.5);
  animation: pulse 2s infinite;
}

.response-time {
  margin-left: auto;
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f9f9f9;
}

.message {
  display: flex;
  margin-bottom: 1rem;
  animation: fade-in 0.3s ease-out;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  background: white;
  padding: 0.75rem;
  border-radius: 12px;
  max-width: 75%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .message-avatar {
  margin-right: 0;
  margin-left: 0.5rem;
}

.message.user .message-content {
  background: var(--primary-color);
  color: white;
}

.message.system .message-content {
  background: #f0f0f0;
  font-style: italic;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

.message.user .message-header {
  color: rgba(255, 255, 255, 0.9);
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
}

.message-text {
  line-height: 1.4;
}

.chat-input {
  padding: 1rem;
  background: white;
  border-top: 1px solid #eee;
}

.chat-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-attach, .btn-send {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-attach {
  background: #f0f0f0;
  color: #555;
}

.btn-attach:hover {
  background: #e0e0e0;
}

.btn-send {
  background: var(--primary-color);
  color: white;
}

.btn-send:hover {
  background: var(--primary-dark);
}

.btn-send:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.faq-section {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.faq-section h2 {
  padding: 1rem;
  margin: 0;
  background: var(--primary-color);
  color: white;
  font-size: 1.2rem;
}

.faq-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.faq-item {
  padding: 1rem;
  border-radius: 8px;
  background: #f9f9f9;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.faq-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.faq-question {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.faq-preview {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.contact-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.contact-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  text-align: center;
}

.contact-methods {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.contact-item {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s;
}

.contact-item:hover {
  background: #f0f0f0;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.contact-info h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.contact-info p {
  margin: 0.25rem 0;
}

.note {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
}

.qrcode-placeholder {
  width: 100px;
  height: 100px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  border: 1px dashed #ccc;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .service-section {
    flex-direction: column;
  }
  
  .chat-container, .faq-section {
    width: 100%;
  }
  
  .contact-methods {
    justify-content: center;
  }
}
</style> 