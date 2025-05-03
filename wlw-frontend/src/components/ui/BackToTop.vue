<template>
  <transition name="fade">
    <div v-show="showBackTop" class="back-to-top" @click="scrollToTop">
      <span class="back-to-top-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </span>
      <span class="ripple"></span>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
  data() {
    return {
      showBackTop: false
    }
  },
  mounted() {
    // 添加滚动事件监听
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    // 移除滚动事件监听，避免内存泄漏
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // 处理滚动事件
    handleScroll() {
      // 当页面滚动超过300px时显示按钮
      this.showBackTop = window.scrollY > 300;
    },
    
    // 滚动到顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
</script>

<style scoped>
/* 回到顶部按钮样式 */
.back-to-top {
  position: fixed;
  left: 30px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--nav-bg, linear-gradient(135deg, #00a4bd, #00629b));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 
              0 8px 16px rgba(0, 0, 0, 0.15),
              inset 0 2px 4px rgba(255, 255, 255, 0.3);
  z-index: 99;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  animation: float 5s ease-in-out infinite;
}

.back-to-top:hover {
  transform: translateY(-7px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 
              0 12px 20px rgba(0, 0, 0, 0.2),
              inset 0 2px 4px rgba(255, 255, 255, 0.3);
  color: var(--nav-indicator, #ffcc00);
}

.back-to-top:active {
  transform: translateY(-2px) scale(0.95);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2), 
              0 6px 10px rgba(0, 0, 0, 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.3);
  transition: all 0.2s;
}

.back-to-top-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  animation: bounce 2s ease infinite;
  transform-origin: center;
  z-index: 2;
}

.back-to-top-icon svg {
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.7));
}

/* 涟漪效果 */
.ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: scale(0);
  z-index: 1;
}

.back-to-top:hover .ripple {
  animation: ripple 1.2s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-2px);
  }
}

@keyframes float {
  0% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 
                0 8px 16px rgba(0, 0, 0, 0.15),
                inset 0 2px 4px rgba(255, 255, 255, 0.3);
    transform: translateY(0px);
  }
  50% {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 
                0 12px 20px rgba(0, 0, 0, 0.15),
                inset 0 2px 4px rgba(255, 255, 255, 0.3);
    transform: translateY(-5px);
  }
  100% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 
                0 8px 16px rgba(0, 0, 0, 0.15),
                inset 0 2px 4px rgba(255, 255, 255, 0.3);
    transform: translateY(0px);
  }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
</style> 