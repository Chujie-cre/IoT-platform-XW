const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // 是否在保存时使用eslint-loader检查
  lintOnSave: false,
  
  // 开发服务器配置
  devServer: {
    // 端口号
    port: 8080,
    
    // 代理配置
    proxy: {
      // 将所有 /api 开头的请求转发到后端服务
      '/api': {
        target: 'http://localhost:4000', // 后端服务地址
        changeOrigin: true, // 改变源地址
        pathRewrite: {
          //'^/api': '/api' // 不再重写路径到/api/v1
          '^/api': '/api/v1' // 重写路径，匹配后端新的API路径格式

        }
      }
    }
  },
  
  // 输出目录，构建生产环境时的输出目录
  outputDir: 'dist',
  
  // 静态资源目录
  assetsDir: 'static',
  
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false
}) 