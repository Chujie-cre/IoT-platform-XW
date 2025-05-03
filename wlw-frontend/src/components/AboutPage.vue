<template>
  <div class="about-container">
    <div class="about-card">
      <div class="creator-section">
        <h2>关于创作者</h2>
        <div class="creator-profile">
          <img src="/avatar/avatar.png" alt="创作者头像" class="creator-avatar">
          <div class="creator-info">
            <h3>雏结</h3>
            <p class="creator-title">小窝物联网平台设计师 / 开发者</p>
            <div class="creator-bio">
              <p>热爱技术，专注于物联网、前端开发和用户体验设计。致力于打造简单易用、功能强大的物联网平台，让科技更贴近生活。</p>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-section">
        <h2>联系方式</h2>
        <div class="contact-list">
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span class="contact-text">邮箱：2425739349@qq.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">🔗</span>
            <span class="contact-text">个人网站：https://king.kingdomofown.cn</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">💼</span>
            <span class="contact-text">GitHub：github.com/ChuJie-Cre</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📱</span>
            <span class="contact-text">微信：18985500792</span>
          </div>
        </div>
      </div>

      <div class="project-section">
        <h2>关于本项目</h2>
        <div class="project-info">
          <p>小窝物联网平台是一个专注于智能家居和物联网设备管理的综合性平台。本项目始于2025年，旨在提供简单易用、功能强大的物联网解决方案。</p>
          <div class="tech-stack">
            <h3>技术栈</h3>
            <div class="tech-tags">
              <span class="tech-tag">Vue 3</span>
              <span class="tech-tag">Node.js</span>
              <span class="tech-tag">Mysql</span>
              <span class="tech-tag">Redis</span>
              <span class="tech-tag">MQTT</span>
              <span class="tech-tag">Git</span>
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="thanks-section">
        <h2>鸣谢</h2>
        <p>感谢所有为本项目提供帮助和支持的人！</p>
        <ul class="thanks-list">
          <li>所有测试用户和提供反馈的朋友们</li>
          <li>开源社区的贡献者</li>
          <li>导师和同行的建议与指导</li>
        </ul>
      </div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style scoped>
.about-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.about-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  overflow: hidden;
}

.about-card > div {
  margin-bottom: 3rem;
}

.about-card > div:last-child {
  margin-bottom: 0;
}

h2 {
  color: var(--primary-color);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.8rem;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px;
}

.creator-profile {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.creator-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.creator-info {
  flex: 1;
}

.creator-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.creator-title {
  color: #666;
  font-style: italic;
  margin-bottom: 1rem;
}

.creator-bio {
  line-height: 1.7;
}

.contact-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  background: #f8f8f8;
  border-radius: 8px;
  transition: all 0.3s;
}

.contact-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.contact-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.project-info {
  line-height: 1.7;
}

.tech-stack {
  margin-top: 1.5rem;
}

.tech-stack h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.tech-tag {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.tech-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.thanks-list {
  list-style-type: none;
  padding: 0;
}

.thanks-list li {
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
  position: relative;
  padding-left: 1.5rem;
}

.thanks-list li:last-child {
  border-bottom: none;
}

.thanks-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-size: 1.5rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .creator-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .creator-avatar {
    margin-bottom: 1.5rem;
  }
  
  h2::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .contact-list {
    grid-template-columns: 1fr;
  }
}
</style> 