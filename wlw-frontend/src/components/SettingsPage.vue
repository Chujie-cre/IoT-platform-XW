<template>
  <div class="settings-page">
    <!-- <h1>个性化设置</h1> -->
    
    <div class="settings-container">
      <div class="settings-section">
        <h2>界面设置</h2>
        
        <div class="setting-item">
          <label>导航栏布局</label>
          <div class="layout-options">
            <div 
              v-for="layout in layoutOptions" 
              :key="layout.value"
              :class="['layout-option', { active: tempSettings.layout === layout.value }]"
              @click="tempSettings.layout = layout.value"
            >
              <div class="layout-preview" :class="layout.value">
                <div class="nav-bar"></div>
                <div class="content"></div>
              </div>
              <span>{{ layout.label }}</span>
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <label>主题颜色</label>
          <div class="color-options">
            <div 
              v-for="color in themeColors" 
              :key="color.value"
              :class="['color-option', { active: tempSettings.theme === color.value }]"
              :style="{ backgroundColor: color.code }"
              @click="tempSettings.theme = color.value"
            ></div>
          </div>
        </div>
        
        <div class="setting-item">
          <label>字体大小</label>
          <select v-model="tempSettings.fontSize">
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="tempSettings.compactMode">
            <span>紧凑模式</span>
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h2>通知设置</h2>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="tempSettings.emailNotifications">
            <span>接收邮件通知</span>
          </label>
        </div>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="tempSettings.smsNotifications">
            <span>接收短信通知</span>
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h2>数据显示</h2>
        
        <div class="setting-item">
          <label>默认排序方式</label>
          <select v-model="tempSettings.defaultSort">
            <option value="name">按名称</option>
            <option value="date">按日期</option>
            <option value="status">按状态</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label>每页显示条目数</label>
          <select v-model="tempSettings.pageSize">
            <option value="10">10条</option>
            <option value="20">20条</option>
            <option value="50">50条</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="settings-actions">
      <div v-if="hasChanges" class="settings-hint">
        <span class="hint-icon">ℹ️</span>
        <span>您有未保存的更改</span>
      </div>
      <div class="settings-buttons">
        <button @click="saveSettings" class="btn-save" :disabled="!hasChanges">保存设置</button>
        <button @click="resetSettings" class="btn-reset">恢复默认</button>
        <button @click="cancelChanges" class="btn-cancel" v-if="hasChanges">取消更改</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPage',
  data() {
    return {
      // 主题相关
      themeColors: [
        { value: 'blue', code: '#0078d4' },
        { value: 'green', code: '#107c10' },
        { value: 'purple', code: '#5c2d91' },
        { value: 'orange', code: '#d83b01' },
        { value: 'red', code: '#e81123' }
      ],
      layoutOptions: [
        { value: 'top', label: '顶部导航' },
        { value: 'side', label: '侧边导航' }
      ],
      
      // 当前设置（已保存的）
      currentSettings: {
        theme: 'blue',
        layout: 'top',
        fontSize: 'medium',
        compactMode: false,
        emailNotifications: true,
        smsNotifications: false,
        defaultSort: 'date',
        pageSize: '20'
      },
      
      // 临时设置（编辑中的）
      tempSettings: {
        theme: 'blue',
        layout: 'top',
        fontSize: 'medium',
        compactMode: false,
        emailNotifications: true,
        smsNotifications: false,
        defaultSort: 'date',
        pageSize: '20'
      }
    }
  },
  computed: {
    hasChanges() {
      return JSON.stringify(this.currentSettings) !== JSON.stringify(this.tempSettings);
    }
  },
  mounted() {
    // 加载已保存的设置
    this.loadSettings();
  },
  methods: {
    // 应用所有设置
    applySettings() {
      // 应用主题
      document.documentElement.setAttribute('data-theme', this.currentSettings.theme);
      
      // 应用布局
      document.documentElement.setAttribute('data-layout', this.currentSettings.layout);
      
      // 应用导航指示器状态
      if (this.currentSettings.layout === 'top') {
        this.$nextTick(() => {
          const indicator = document.querySelector('.nav-indicator');
          if (indicator) {
            indicator.style.display = 'block';
            
            // 更新指示器位置
            const activeLink = document.querySelector('.fancy-nav .router-link-active');
            if (activeLink) {
              indicator.style.width = `${activeLink.offsetWidth}px`;
              indicator.style.left = `${activeLink.offsetLeft}px`;
            }
          }
        });
      } else if (this.currentSettings.layout === 'side') {
        const indicator = document.querySelector('.nav-indicator');
        if (indicator) {
          indicator.style.display = 'none';
        }
      }
      
      // 应用字体大小
      document.documentElement.setAttribute('data-font-size', this.currentSettings.fontSize);
      
      // 应用紧凑模式
      document.body.classList.toggle('compact-mode', this.currentSettings.compactMode);
    },
    
    // 保存所有设置
    saveSettings() {
      // 更新当前设置
      this.currentSettings = JSON.parse(JSON.stringify(this.tempSettings));
      
      // 应用设置
      this.applySettings();
      
      // 保存到localStorage
      localStorage.setItem('userSettings', JSON.stringify(this.currentSettings));
      
      // 提示用户
      alert('设置已保存并应用');
    },
    
    // 取消更改
    cancelChanges() {
      // 将临时设置重置为当前设置
      this.tempSettings = JSON.parse(JSON.stringify(this.currentSettings));
      
      // 提示用户
      alert('已恢复到上次保存的设置');
    },
    
    // 重置为默认设置
    resetSettings() {
      if (confirm('确定要恢复默认设置吗？')) {
        // 设置默认值
        const defaultSettings = {
          theme: 'blue',
          layout: 'top',
          fontSize: 'medium',
          compactMode: false,
          emailNotifications: true,
          smsNotifications: false,
          defaultSort: 'date',
          pageSize: '20'
        };
        
        // 更新当前设置和临时设置
        this.currentSettings = JSON.parse(JSON.stringify(defaultSettings));
        this.tempSettings = JSON.parse(JSON.stringify(defaultSettings));
        
        // 应用设置
        this.applySettings();
        
        // 清除已保存的设置
        localStorage.removeItem('userSettings');
        
        // 提示用户
        alert('已恢复为默认设置');
      }
    },
    
    // 加载已保存的设置
    loadSettings() {
      const savedSettings = localStorage.getItem('userSettings');
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          
          // 更新当前设置
          this.currentSettings = {
            theme: settings.theme || 'blue',
            layout: settings.layout || 'top',
            fontSize: settings.fontSize || 'medium',
            compactMode: settings.compactMode || false,
            emailNotifications: settings.emailNotifications || true,
            smsNotifications: settings.smsNotifications || false,
            defaultSort: settings.defaultSort || 'date',
            pageSize: settings.pageSize || '20'
          };
          
          // 复制到临时设置
          this.tempSettings = JSON.parse(JSON.stringify(this.currentSettings));
          
          // 应用设置
          this.applySettings();
        } catch (e) {
          console.error('加载用户设置失败:', e);
        }
      }
    }
  }
}
</script>

<style scoped>
.settings-page {
  width: 80%;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  text-align: center;
  font-size: 2rem;
  position: relative;
}

h1::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: var(--primary-color);
  margin: 0.5rem auto 0;
  border-radius: 2px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.settings-section {
  background-color: white;
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.settings-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

h2 {
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
  font-size: 1.3rem;
  color: var(--primary-color);
  position: relative;
}

h2::before {
  content: '⚙️';
  margin-right: 8px;
  opacity: 0.8;
}

.setting-item {
  margin-bottom: 2rem;
  position: relative;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 600;
  color: #444;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 10px;
}

.setting-item select {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-size: 1rem;
  transition: all 0.3s;
}

.setting-item select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
  background-color: white;
}

/* 主题颜色选择器 */
.color-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.15) rotate(5deg);
}

.color-option.active {
  transform: scale(1.15);
  box-shadow: 0 0 0 3px white, 0 0 0 6px currentColor, 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 按钮样式 */
.settings-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.5rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.settings-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f39c12;
  font-weight: 600;
}

.hint-icon {
  font-size: 1.2rem;
}

.settings-buttons {
  display: flex;
  gap: 1rem;
}

.btn-save, .btn-reset, .btn-cancel {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 120px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-save {
  background-color: var(--primary-color);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-reset {
  background-color: #f0f0f0;
  color: #333;
}

.btn-reset:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
  background-color: #ff6b6b;
  color: white;
}

.btn-cancel:hover {
  background-color: #e55c5c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 布局选项样式 */
.layout-options {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s;
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.layout-option:hover {
  background-color: rgba(var(--primary-color-rgb), 0.05);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.layout-option.active {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  border: 2px solid var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(var(--primary-color-rgb), 0.15);
}

.layout-preview {
  width: 140px;
  height: 90px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.layout-option:hover .layout-preview {
  transform: scale(1.05);
}

.layout-option.active .layout-preview {
  border-color: var(--primary-color);
}

.layout-preview.top .nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-color: var(--primary-color);
  display: flex;
  justify-content: center;
  align-items: center;
}

.layout-preview.top .nav-bar::before {
  content: "";
  width: 70%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.layout-preview.top .content {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.layout-preview.top .content::before {
  content: "";
  width: 50%;
  height: 60%;
  background-color: #eee;
  border-radius: 2px;
}

.layout-preview.side .nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 25px;
  background-color: var(--primary-color);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.layout-preview.side .nav-bar::before,
.layout-preview.side .nav-bar::after {
  content: "";
  width: 10px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.layout-preview.side .content {
  position: absolute;
  top: 0;
  left: 25px;
  right: 0;
  bottom: 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.layout-preview.side .content::before {
  content: "";
  width: 60%;
  height: 60%;
  background-color: #eee;
  border-radius: 2px;
}

.layout-option span {
  font-size: 1rem;
  color: #555;
  font-weight: 500;
}

@media (max-width: 768px) {
  .settings-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .settings-buttons {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .layout-options {
    justify-content: center;
  }
  
  .color-options {
    justify-content: center;
  }
}
</style> 