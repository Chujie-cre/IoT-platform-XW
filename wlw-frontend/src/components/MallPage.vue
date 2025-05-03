<template>
    <div class="mall-container">
      <div class="mall-page">
        <iframe 
          src="http://mall.kingdomofown.cn" 
          class="mall-iframe"
          title="商城页面"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MallPage'
  }
  </script>
  
  <style scoped>
  .mall-container {
    padding-top: 10px;
    width: 100%;
    position: relative;
    padding: 0;
    margin: 0;
    max-width: 100%;
  }
  
  .mall-page {
    width: 100%;
    height: calc(100vh - 100px);
    overflow: hidden;
    position: relative;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    padding: 0;
    margin: 0;
  }
  
  .mall-iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  </style> 