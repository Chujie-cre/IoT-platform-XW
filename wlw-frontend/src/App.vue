<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">
        <img src="/logo.png" alt="小窝物联网平台" class="app-logo">
        <span class="title-char" v-for="(char, index) in '小窝物联网平台'" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">{{ char }}</span>
      </h1>
      <nav class="fancy-nav">
        <router-link to="/" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">首页</span>
        </router-link>
        <router-link to="/products" class="nav-item">
          <span class="nav-icon">📦</span>
          <span class="nav-text">产品管理</span>
        </router-link>
        <router-link to="/devices" class="nav-item">
          <span class="nav-icon">📱</span>
          <span class="nav-text">设备管理</span>
        </router-link>
        <router-link to="/docs" class="nav-item">
          <span class="nav-icon">📚</span>
          <span class="nav-text">文档</span>
        </router-link>
        <router-link to="/mall" class="nav-item">
          <span class="nav-icon">🛒</span>
          <span class="nav-text">商城</span>
        </router-link>
        <router-link to="/settings" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">个性化设置</span>
        </router-link>
        <router-link to="/after-sales" class="nav-item">
          <span class="nav-icon">🔧</span>
          <span class="nav-text">售后服务</span>
        </router-link>
        <router-link to="/logs" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-text">系统日志</span>
        </router-link>
        <router-link to="/user" class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-text">个人信息</span>
        </router-link>
        <router-link to="/about" class="nav-item">
          <span class="nav-icon">ℹ️</span>
          <span class="nav-text">关于我们</span>
        </router-link>
        <div class="nav-indicator"></div>
      </nav>
    </header>
    
    <div class="app-main-wrapper">
      <main class="app-content">
        <!-- 路由视图 -->
        <router-view/>
      </main>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 小窝物联网平台 By 雏结</p>
          <a href="https://beian.miit.gov.cn/" target="_blank" class="beian-link">
            <img id="China" src="//img.alicdn.com/tfs/TB1..50QpXXXXX7XpXXXXXXXXXX-40-40.png"/>
            <span>黔ICP备2025044143号</span>
          </a>
        </div>
      </footer>
    </div>
    
    <!-- 全局回到顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script>
import { BackToTop } from './components/ui'

export default {
  name: 'App',
  components: {
    BackToTop
  },
  mounted() {
    // 初始化导航指示器位置
    this.updateNavIndicator();
    // 监听路由变化以更新指示器
    this.$router.afterEach(() => {
      this.updateNavIndicator();
    });
  },
  methods: {
    updateNavIndicator() {
      this.$nextTick(() => {
        const activeLink = document.querySelector('.fancy-nav .router-link-active');
        const indicator = document.querySelector('.nav-indicator');
        
        if (activeLink && indicator) {
          indicator.style.width = `${activeLink.offsetWidth}px`;
          indicator.style.left = `${activeLink.offsetLeft}px`;
        }
      });
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 基础页面样式 */
body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

/* 主题系统变量定义 */
:root {
  --primary-color: #0078d4;
  --primary-color-rgb: 0, 120, 212;
  --primary-dark: #0063ad;
  --text-color: #333;
  --background-color: #f5f5f5;
  --font-size-base: 16px;
  --nav-bg: linear-gradient(135deg, #00a4bd, #00629b);
  --nav-hover: rgba(255, 255, 255, 0.2);
  --nav-active: #fff;
  --nav-indicator: #ffcc00;
}

/* 蓝色主题 */
html[data-theme="blue"] {
  --primary-color: #0078d4;
  --primary-color-rgb: 0, 120, 212;
  --primary-dark: #0063ad;
  --nav-bg: linear-gradient(135deg, #00a4bd, #00629b);
  --nav-indicator: #ffcc00;
}

/* 绿色主题 */
html[data-theme="green"] {
  --primary-color: #107c10;
  --primary-color-rgb: 16, 124, 16;
  --primary-dark: #0b5a0b;
  --nav-bg: linear-gradient(135deg, #7ed56f, #28b485);
  --nav-indicator: #ffa600;
}

/* 紫色主题 */
html[data-theme="purple"] {
  --primary-color: #5c2d91;
  --primary-color-rgb: 92, 45, 145;
  --primary-dark: #4a2276;
  --nav-bg: linear-gradient(135deg, #9c27b0, #5c2d91);
  --nav-indicator: #00e5ff;
}

/* 橙色主题 */
html[data-theme="orange"] {
  --primary-color: #d83b01;
  --primary-color-rgb: 216, 59, 1;
  --primary-dark: #a52e01;
  --nav-bg: linear-gradient(135deg, #ff9800, #ff5722);
  --nav-indicator: #2196f3;
}

/* 红色主题 */
html[data-theme="red"] {
  --primary-color: #e81123;
  --primary-color-rgb: 232, 17, 35;
  --primary-dark: #ba0e1e;
  --nav-bg: linear-gradient(135deg, #ff5252, #e81123);
  --nav-indicator: #ffeb3b;
}

/* 字体大小设置 */
html[data-font-size="small"] {
  --font-size-base: 14px;
}

html[data-font-size="medium"] {
  --font-size-base: 16px;
}

html[data-font-size="large"] {
  --font-size-base: 18px;
}

/* 紧凑模式样式 */
body.compact-mode .app-content {
  padding: 1rem;
}

body.compact-mode .setting-item {
  margin-bottom: 0.8rem;
}

/* 顶部导航布局样式 */
html[data-layout="top"] .app {
  flex-direction: column;
  min-height: 100vh;
}

/* 侧边导航布局样式 */
html[data-layout="side"] .app {
  flex-direction: row;
  min-height: 100vh;
}

html[data-layout="side"] .app-header {
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  flex-direction: column;
  align-items: flex-start;
  padding: 2rem 1rem;
  z-index: 100;
}

html[data-layout="side"] .app-main-wrapper {
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
}

html[data-layout="side"] .app-content {
  flex: 1;
  width: 100%;
}

html[data-layout="side"] .app-footer {
  width: 100%;
}

html[data-layout="side"] .fancy-nav {
  flex-direction: column;
  width: 100%;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

html[data-layout="side"] .nav-item {
  width: 100%;
  margin-bottom: 0.5rem;
  margin-right: 0;
  padding: 0.8rem 1rem;
  border-radius: 8px;
}

html[data-layout="side"] .nav-item:hover {
  background-color: var(--nav-hover);
}

html[data-layout="side"] .nav-item.active {
  background-color: var(--nav-active);
  color: var(--primary-color);
}

html[data-layout="side"] .nav-indicator {
  display: none;
}

html[data-layout="side"] .app-title {
  margin-bottom: 2rem;
}

/* 应用主容器样式 */
.app {
  display: flex;
  min-height: 100vh;
  overflow-x: hidden;
  font-size: var(--font-size-base);
}

.app-main-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100vh;
}

/* 应用标题样式 */
.app-title {
  margin-bottom: 0.8rem;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
}

/* Logo样式 */
.app-logo {
  height: 40px;
  width: auto;
  margin-right: 10px;
  animation: rotate 4s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Logo旋转动画 */
@keyframes rotate {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}

/* 标题文字动画效果 */
.title-char {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
  transform-origin: center;
}

/* 标题浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 导航栏头部样式 */
.app-header {
  background: var(--nav-bg);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 导航菜单样式 */
.fancy-nav {
  display: flex;
  position: relative;
  margin-top: 0.5rem;
  border-radius: 30px;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

/* 导航项样式 */
.nav-item {
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  margin-right: 0.3rem;
  z-index: 1;
}

/* 导航项悬停效果 */
.nav-item:hover {
  background: var(--nav-hover);
  transform: translateY(-2px);
}

/* 导航图标样式 */
.nav-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
  position: relative;
}

/* 图标脉冲动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 导航文本样式 */
.nav-text {
  position: relative;
  overflow: hidden;
}

/* 导航文本下划线效果 */
.nav-text::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--nav-indicator);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-text::after {
  transform: translateX(0);
}

/* 导航指示器样式 */
.nav-indicator {
  position: absolute;
  bottom: 0.5rem;
  height: 38px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 0;
}

/* 路由激活状态样式 */
.router-link-active {
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.15);
}

.router-link-active .nav-icon {
  animation-play-state: paused;
}

.router-link-active .nav-text::after {
  transform: translateX(0);
}

/* 全局按钮样式 */
.btn {
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  text-decoration: none;
  display: inline-block;
  margin-right: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
  position: relative;
}

/* 按钮悬停效果 */
.btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.15);
}

/* 按钮点击效果 */
.btn:active {
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

/* 按钮波纹效果 */
.btn::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  transform: scale(0);
  transition: transform 0.4s;
}

.btn:hover::after {
  transform: scale(1.5);
  opacity: 0;
}

/* 主内容区域样式 */
.app-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* 文档页特殊样式 */
body.docs-page, body.mall-page {
  overflow: hidden; /* 防止文档页出现滚动条 */
}

body.docs-page .app-content, body.mall-page .app-content {
  padding: 0px;
  max-width: 100%;
  height: calc(100vh - 70px); /* 减去页脚高度 */
  overflow: hidden;
}

html[data-layout="side"] body.docs-page .app-content, 
html[data-layout="side"] body.mall-page .app-content {
  height: calc(100vh - 70px); /* 保持与垂直布局一致 */
}

/* 商城页面特殊样式 */
body.mall-page .app-content {
  margin: 0;
  width: 100%;
}

html[data-layout="side"] body.mall-page .app-content {
  width: 100%;
}

/* 日志页面特殊样式 */
body.logs-page .app-content {
  padding: 1rem;
  max-width: 100%;
  overflow-y: auto;
}

/* 页脚样式 */
.app-footer {
  background: var(--nav-bg);
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto; /* 确保页脚位于底部 */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

/* 页脚内容布局 */
.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-content p {
  margin: 0;
}

/* 页脚文字悬停效果 */
.footer-content span:hover{
  color: rgb(232, 172, 255);
  transition: 0.6s;
}

/* 备案链接样式 */
.beian-link {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.beian-link img {
  height: 1em;
  width: auto;
  margin-right: 0.3rem;
  vertical-align: middle;
}
</style> 