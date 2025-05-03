import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入Tailwind CSS
import './assets/output.css'

// 加载用户设置
const loadUserSettings = () => {
  const savedSettings = localStorage.getItem('userSettings')
  
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      
      // 应用主题
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme)
      }
      
      // 应用布局
      if (settings.layout) {
        document.documentElement.setAttribute('data-layout', settings.layout)
      }
      
      // 应用字体大小
      if (settings.fontSize) {
        document.documentElement.setAttribute('data-font-size', settings.fontSize)
      }
      
      // 应用紧凑模式
      if (settings.compactMode) {
        document.body.classList.toggle('compact-mode', settings.compactMode)
      }
    } catch (e) {
      console.error('加载用户设置失败:', e)
    }
  }
}

// 在应用启动前加载设置
loadUserSettings()

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载到DOM
app.mount('#app') 