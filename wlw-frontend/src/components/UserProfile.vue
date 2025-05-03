<template>
  <div class="user-profile">
    <transition name="fade" appear>
      <div class="profile-container">
        <div class="profile-header">
          <h2>个人信息</h2>
          <button class="btn btn-edit" @click="toggleEditMode">
            <span class="btn-icon">{{ isEditing ? '✕' : '✎' }}</span>
            <span class="btn-text">{{ isEditing ? '取消编辑' : '编辑信息' }}</span>
          </button>
        </div>

        <div class="profile-content">
          <div class="avatar-section">
            <div class="avatar-container" :class="{ 'pulse': isEditing }">
              <div class="avatar-wrapper">
                <img :src="userInfo.avatar || '/avatar/avatar.png'" alt="用户头像" class="avatar">
                <div class="avatar-overlay" v-if="isEditing">
                  <span class="upload-icon">📷</span>
                </div>
              </div>
              <transition name="slide-fade">
                <div v-if="isEditing" class="avatar-upload">
                  <input type="file" accept="image/*" @change="handleAvatarUpload" id="avatar-input" class="avatar-input">
                  <label for="avatar-input" class="btn btn-upload">更换头像</label>
                </div>
              </transition>
            </div>
            <div class="user-status online">
              <span class="status-indicator"></span>
              <span class="status-text">在线</span>
            </div>
          </div>

          <div class="info-section">
            <transition-group name="list" tag="div" class="info-list">
              <div class="info-group" key="username">
                <label>用户名</label>
                <transition name="field-toggle" mode="out-in">
                  <input v-if="isEditing" v-model="userInfo.username" type="text" class="input-field animated" key="edit-username">
                  <span v-else class="info-value animated" key="view-username">{{ userInfo.username }}</span>
                </transition>
              </div>

              <div class="info-group" key="email">
                <label>邮箱</label>
                <transition name="field-toggle" mode="out-in">
                  <input v-if="isEditing" v-model="userInfo.email" type="email" class="input-field animated" key="edit-email">
                  <span v-else class="info-value animated" key="view-email">{{ userInfo.email }}</span>
                </transition>
              </div>

              <div class="info-group" key="phone">
                <label>手机号</label>
                <transition name="field-toggle" mode="out-in">
                  <input v-if="isEditing" v-model="userInfo.phone" type="tel" class="input-field animated" key="edit-phone">
                  <span v-else class="info-value animated" key="view-phone">{{ userInfo.phone }}</span>
                </transition>
              </div>

              <div class="info-group" key="registerTime">
                <label>注册时间</label>
                <span class="info-value animated">{{ formatDate(userInfo.registerTime) }}</span>
              </div>

              <div class="info-group" key="lastLogin">
                <label>最后登录</label>
                <span class="info-value animated">{{ formatDate(userInfo.lastLogin) }}</span>
              </div>
            </transition-group>
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="isEditing" class="action-buttons">
            <button class="btn btn-save" @click="saveUserInfo">
              <span class="btn-icon">💾</span>
              <span class="btn-text">保存修改</span>
            </button>
            <button class="btn btn-cancel" @click="cancelEdit">
              <span class="btn-icon">🗑️</span>
              <span class="btn-text">放弃更改</span>
            </button>
          </div>
        </transition>
        
        <div class="additional-info">
          <div class="info-card">
            <div class="info-card-header">
              <span class="info-card-icon">🏆</span>
              <h3>账户级别</h3>
            </div>
            <div class="info-card-content">
              <div class="progress-bar">
                <div class="progress" :style="{ width: userLevel.progress + '%' }"></div>
              </div>
              <p class="level-info">{{ userLevel.name }} ({{ userLevel.progress }}%)</p>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-card-header">
              <span class="info-card-icon">🔐</span>
              <h3>账户安全</h3>
            </div>
            <div class="info-card-content">
              <div class="security-items">
                <div class="security-item">
                  <span class="security-status" :class="{ 'verified': true }">✓</span>
                  <span class="security-text">手机已验证</span>
                </div>
                <div class="security-item">
                  <span class="security-status" :class="{ 'verified': true }">✓</span>
                  <span class="security-text">邮箱已验证</span>
                </div>
                <div class="security-item">
                  <span class="security-status" :class="{ 'verified': false }">✗</span>
                  <span class="security-text">未开启两步验证</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="info-card system-config-card">
            <div class="info-card-header">
              <span class="info-card-icon">⚙️</span>
              <h3>系统配置</h3>
              <button class="btn-toggle-config" @click="toggleConfigEdit">
                {{ isConfigEditing ? '收起' : '展开' }}
              </button>
            </div>
            <transition name="slide-down">
              <div class="info-card-content" v-if="isConfigEditing">
                <div class="config-description">
                  <p>您可以在此处配置系统环境变量，无需修改后端代码。所有修改将在验证后生效。</p>
                </div>
                
                <form @submit.prevent="saveConfigVariables" class="config-form">
                  <div v-for="(variable, index) in configVariables" :key="index" class="config-item">
                    <label>{{ variable.label }}</label>
                    <div class="input-with-validation">
                      <input 
                        :type="variable.type" 
                        v-model="variable.value" 
                        :placeholder="variable.placeholder"
                        class="config-input"
                        :class="{'has-error': variable.hasError}"
                      />
                      <transition name="fade">
                        <span v-if="variable.hasError" class="error-message">{{ variable.errorMsg }}</span>
                      </transition>
                      <span class="input-icon" v-if="variable.isValid">✓</span>
                    </div>
                    <p class="input-description">{{ variable.description }}</p>
                  </div>
                  
                  <div class="config-actions">
                    <button type="submit" class="btn btn-save-config">
                      <span class="btn-icon">💾</span>
                      <span class="btn-text">保存配置</span>
                    </button>
                    <button type="button" @click="resetConfigVariables" class="btn btn-reset-config">
                      <span class="btn-icon">🔄</span>
                      <span class="btn-text">重置</span>
                    </button>
                    <button type="button" @click="testConnection" class="btn btn-test-config">
                      <span class="btn-icon">🔌</span>
                      <span class="btn-text">测试连接</span>
                    </button>
                  </div>
                </form>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  data() {
    return {
      isEditing: false,
      isConfigEditing: false,
      originalUserInfo: null,
      userInfo: {
        username: '示例用户',
        email: 'example@email.com',
        phone: '13800138000',
        avatar: null,
        registerTime: new Date(),
        lastLogin: new Date()
      },
      userLevel: {
        name: '高级用户',
        progress: 75
      },
      configVariables: [
        {
          id: 'api_key',
          label: 'API密钥',
          type: 'password',
          value: '',
          placeholder: '请输入API密钥',
          description: '用于访问第三方服务的API密钥',
          isValid: false,
          hasError: false,
          errorMsg: '',
          validator: (value) => value.length >= 8
        },
        {
          id: 'server_url',
          label: '服务器地址',
          type: 'url',
          value: '',
          placeholder: 'https://example.com/api',
          description: 'API服务器的完整URL地址',
          isValid: false,
          hasError: false,
          errorMsg: '',
          validator: (value) => /^https?:\/\/.+/.test(value)
        },
        {
          id: 'mqtt_broker',
          label: 'MQTT代理地址',
          type: 'text',
          value: '',
          placeholder: 'mqtt://broker.example.com:1883',
          description: 'MQTT代理服务器地址和端口',
          isValid: false,
          hasError: false,
          errorMsg: '',
          validator: (value) => /^mqtt:\/\/.+/.test(value)
        },
        {
          id: 'db_connection',
          label: '数据库连接字符串',
          type: 'password',
          value: '',
          placeholder: 'mongodb://user:password@host:port/database',
          description: '数据库连接信息',
          isValid: false,
          hasError: false,
          errorMsg: '',
          validator: (value) => value.length > 10
        },
        {
          id: 'admin_token',
          label: '管理员令牌',
          type: 'password',
          value: '',
          placeholder: '请输入管理员令牌',
          description: '用于高级操作的管理员验证令牌',
          isValid: false,
          hasError: false,
          errorMsg: '',
          validator: (value) => value.length >= 12
        }
      ],
      originalConfigVariables: null
    }
  },
  mounted() {
    // 尝试从本地存储加载配置变量
    this.loadConfigFromStorage();
  },
  methods: {
    toggleEditMode() {
      if (!this.isEditing) {
        // 保存原始用户信息用于取消编辑时恢复
        this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo));
      }
      this.isEditing = !this.isEditing;
    },
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // 在实际应用中，这里会上传头像到服务器
        // 这里简单实现一个预览功能
        const reader = new FileReader();
        reader.onload = (e) => {
          this.userInfo.avatar = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    saveUserInfo() {
      // 这里添加保存用户信息的逻辑
      console.log('保存用户信息:', this.userInfo);
      this.isEditing = false;
      
      // 显示保存成功消息
      this.$nextTick(() => {
        alert('个人信息保存成功！');
      });
    },
    cancelEdit() {
      // 恢复原始用户信息
      if (this.originalUserInfo) {
        this.userInfo = JSON.parse(JSON.stringify(this.originalUserInfo));
      }
      this.isEditing = false;
    },
    formatDate(date) {
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // 新增的配置相关方法
    toggleConfigEdit() {
      if (!this.isConfigEditing) {
        // 保存原始配置信息用于取消编辑时恢复
        this.originalConfigVariables = JSON.parse(JSON.stringify(this.configVariables));
      } else {
        // 如果是收起，则不保存修改
        if (this.originalConfigVariables) {
          this.configVariables = JSON.parse(JSON.stringify(this.originalConfigVariables));
        }
      }
      this.isConfigEditing = !this.isConfigEditing;
    },
    
    validateConfigVariables() {
      let isValid = true;
      
      // 验证每个变量
      this.configVariables.forEach(variable => {
        const validationResult = variable.validator(variable.value);
        variable.isValid = validationResult;
        
        if (!validationResult) {
          isValid = false;
          variable.hasError = true;
          
          // 设置错误消息
          switch(variable.id) {
            case 'api_key':
              variable.errorMsg = 'API密钥至少需要8个字符';
              break;
            case 'server_url':
              variable.errorMsg = '请输入有效的URL地址(以http://或https://开头)';
              break;
            case 'mqtt_broker':
              variable.errorMsg = '请输入有效的MQTT代理地址(以mqtt://开头)';
              break;
            case 'db_connection':
              variable.errorMsg = '请输入有效的数据库连接字符串';
              break;
            case 'admin_token':
              variable.errorMsg = '管理员令牌至少需要12个字符';
              break;
            default:
              variable.errorMsg = '输入无效';
          }
        } else {
          variable.hasError = false;
          variable.errorMsg = '';
        }
      });
      
      return isValid;
    },
    
    saveConfigVariables() {
      if (this.validateConfigVariables()) {
        // 保存到本地存储或发送到服务器
        this.saveConfigToStorage();
        
        alert('系统配置已成功保存并生效！');
        this.isConfigEditing = false;
      } else {
        alert('请修正表单中的错误后再保存！');
      }
    },
    
    resetConfigVariables() {
      // 重置为默认值
      this.configVariables.forEach(variable => {
        variable.value = '';
        variable.isValid = false;
        variable.hasError = false;
        variable.errorMsg = '';
      });
    },
    
    saveConfigToStorage() {
      // 将配置保存到本地存储
      const configData = {};
      this.configVariables.forEach(variable => {
        configData[variable.id] = variable.value;
      });
      
      localStorage.setItem('wlw_system_config', JSON.stringify(configData));
      
      // 在真实环境中，这里应该调用API将配置发送到后端
      console.log('保存配置到后端:', configData);
    },
    
    loadConfigFromStorage() {
      // 从本地存储加载配置
      const storedConfig = localStorage.getItem('wlw_system_config');
      if (storedConfig) {
        const configData = JSON.parse(storedConfig);
        
        // 更新配置值
        this.configVariables.forEach(variable => {
          if (configData[variable.id]) {
            variable.value = configData[variable.id];
            // 验证已加载的值
            variable.isValid = variable.validator(variable.value);
          }
        });
      }
    },
    
    testConnection() {
      if (!this.validateConfigVariables()) {
        alert('请先修正表单中的错误！');
        return;
      }
      
      // 模拟连接测试
      alert('正在测试连接...');
      
      // 在实际应用中，这里应该发送测试请求到后端
      setTimeout(() => {
        alert('连接测试成功！所有配置都有效。');
      }, 1500);
    }
  }
}
</script>

<style scoped>
/* 主容器样式 */
.user-profile {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  padding: 2rem 1rem;
  perspective: 1000px;
}

.profile-container {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 
              0 1px 8px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(0);
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.profile-container:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 
              0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px) translateZ(0);
}

/* 头部样式 */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(to right, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 15px 15px 0 0;
  position: relative;
  overflow: hidden;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%);
  opacity: 0;
  transform: scale(0.5);
  transition: all 1s ease;
}

.profile-header:hover::before {
  opacity: 1;
  transform: scale(1);
}

.profile-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

/* 内容区样式 */
.profile-content {
  display: flex;
  padding: 2rem;
  gap: 2.5rem;
  border-bottom: 1px solid #eee;
}

/* 头像部分 */
.avatar-section {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  margin-bottom: 1.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.avatar-container.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb, 0, 120, 212), 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb, 0, 120, 212), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb, 0, 120, 212), 0);
  }
}

.avatar-wrapper {
  position: relative;
  border-radius: 50%;
  padding: 5px;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}

.avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.5s ease;
  border: 3px solid white;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 2.5rem;
  color: white;
  animation: bounce 1s infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

.avatar-upload {
  margin-top: 1rem;
  text-align: center;
}

.avatar-input {
  display: none;
}

/* 用户状态 */
.user-status {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-top: 1rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.online .status-indicator {
  background: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.status-text {
  color: #333;
  font-size: 0.9rem;
}

/* 信息部分 */
.info-section {
  flex: 1;
  padding-top: 0.5rem;
}

.info-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-group {
  position: relative;
  transition: all 0.3s ease;
}

.info-group:hover {
  transform: translateX(5px);
}

.info-group label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.info-group:hover label {
  color: var(--primary-color);
}

.info-value {
  display: block;
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
  padding: 0.8rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.info-group:hover .info-value {
  border-bottom-color: var(--primary-color);
}

.input-field {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 0, 120, 212), 0.2);
  background: white;
}

/* 按钮部分 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  background: #f9f9f9;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0));
  transform: translateY(-100%);
  transition: all 0.3s ease;
}

.btn:hover::before {
  transform: translateY(0);
}

.btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.btn-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.btn-edit {
  background: var(--primary-color);
  color: white;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-cancel {
  background: #f44336;
  color: white;
}

.btn-upload {
  background: #2196F3;
  color: white;
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
}

/* 附加信息卡片 */
.additional-info {
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.info-card {
  background: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.info-card-header {
  padding: 1.2rem;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
}

.info-card-icon {
  font-size: 1.5rem;
  margin-right: 0.8rem;
}

.info-card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.info-card-content {
  padding: 1.5rem;
}

/* 进度条 */
.progress-bar {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #2196F3, #4CAF50);
  border-radius: 6px;
  transition: width 1s ease;
}

.level-info {
  text-align: center;
  font-weight: 500;
  color: #555;
}

/* 安全项目 */
.security-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item {
  display: flex;
  align-items: center;
}

.security-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-weight: bold;
}

.verified {
  background: #4CAF50;
  color: white;
}

.security-item:nth-child(3) .security-status {
  background: #f44336;
  color: white;
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.field-toggle-enter-active,
.field-toggle-leave-active {
  transition: all 0.3s;
}

.field-toggle-enter-from,
.field-toggle-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

.animated {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    align-items: center;
  }
  
  .avatar-section {
    margin-bottom: 2rem;
  }
  
  .info-list {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    width: 100%;
  }
  
  .additional-info {
    grid-template-columns: 1fr;
  }
}

/* 配置卡片样式 */
.system-config-card {
  grid-column: 1 / -1;
}

.system-config-card .info-card-header {
  justify-content: flex-start;
  position: relative;
}

.btn-toggle-config {
  position: absolute;
  right: 1.2rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-toggle-config:hover {
  background: rgba(255, 255, 255, 0.2);
}

.config-description {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-item label {
  font-weight: 500;
  color: #444;
}

.input-with-validation {
  position: relative;
}

.config-input {
  width: 100%;
  padding: 0.8rem;
  padding-right: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.config-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 0, 120, 212), 0.2);
  background: white;
}

.config-input.has-error {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.2);
}

.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #4CAF50;
  font-weight: bold;
}

.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: block;
}

.input-description {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.3rem;
}

.config-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-save-config {
  background: #4CAF50;
  color: white;
}

.btn-reset-config {
  background: #f44336;
  color: white;
}

.btn-test-config {
  background: #2196F3;
  color: white;
}

/* 滑动动画 */
.slide-down-enter-active {
  transition: all 0.3s ease-out;
  max-height: 2000px;
  opacity: 1;
}

.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .config-actions {
    flex-direction: column;
  }
  
  .config-actions .btn {
    width: 100%;
  }
}
</style> 