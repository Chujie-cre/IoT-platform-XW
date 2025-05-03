<template>
  <div class="document-container">
    <div class="document-page">
      <iframe 
        src="https://learn.kingdomofown.cn/markdown/xiaowowlw.html" 
        class="document-iframe"
        title="文档页面"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentPage'
}
</script>

<style scoped>
.document-container {
  width: 100%;
  padding-top: 10px;
  position: relative;
}

.document-page {
  width: 100%;
  height: calc(100vh - 100px); /* 减少减去的像素量 */
  overflow: hidden;
  position: relative;
  border: 1px solid #eaeaea;
  border-radius: 4px;
}

.document-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style> 