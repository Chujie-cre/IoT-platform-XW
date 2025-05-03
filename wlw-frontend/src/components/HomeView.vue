<template>
  <div class="page-wrapper">
    <!-- 背景组件 -->
    <BackGround 
      class="background" 
      color="#722ed1" 
      :quantity="600" 
      :staticity="40" 
      :ease="35"
    />
    
    <div class="home-container">
      <!-- 统计卡片区域 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon product-icon">📦</div>
          <div class="stat-content">
            <h3>产品总数</h3>
            <p class="stat-value">{{ stats.totalProducts || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon device-icon">📱</div>
          <div class="stat-content">
            <h3>设备总数</h3>
            <p class="stat-value">{{ stats.totalDevices || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon online-icon">🟢</div>
          <div class="stat-content">
            <h3>在线设备</h3>
            <p class="stat-value">{{ stats.onlineDevices || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon offline-icon">🔴</div>
          <div class="stat-content">
            <h3>离线设备</h3>
            <p class="stat-value">{{ stats.offlineDevices || 0 }}</p>
          </div>
        </div>
      </div>
      
      <!-- 主布局区域 - 五个区域（四个角落放图表，中间放IconCloud） -->
      <div class="dashboard-layout">
        <!-- 左上角图表 -->
        <div class="chart-card top-left">
          <h2>设备状态分布</h2>
          <div v-if="loading.stats" class="chart-loading">加载中...</div>
          <div v-else class="chart-container">
            <v-chart class="chart" :option="deviceStatusOption" autoresize />
          </div>
        </div>
        
        <!-- 右上角图表 -->
        <div class="chart-card top-right">
          <h2>设备类型分布</h2>
          <div v-if="loading.stats" class="chart-loading">加载中...</div>
          <div v-else class="chart-container">
            <v-chart class="chart" :option="deviceTypeOption" autoresize />
          </div>
        </div>
        
        <!-- 中间圆形区域 - IconCloud -->
        <div class="center-circle">
          <IconCloud 
            class="icon-cloud" 
            :images="[
              '/logo.png',
              '/hero-image.png',
              '/ui-image/1.png',
              '/ui-image/2.png',
              '/ui-image/3.png',
              '/ui-image/4.png',
              '/ui-image/pepper-hot-solid.svg',
              '/ui-image/javascript.svg',
              '/ui-image/mongodb-icon-1.svg',
              '/ui-image/mysql-logo-pure.svg',
              '/ui-image/nodejs-3.svg',
              '/ui-image/vue-9.svg',
              '/ui-image/youtube-icon-5.svg',
              '/ui-image/tiktok.svg',
              '/ui-image/html.svg',
              '/ui-image/css.svg',
              '/ui-image/facebook.svg',
              '/ui-image/ama.svg',
              '/ui-image/apple.svg',
              '/ui-image/google.svg',
              '/ui-image/microsoft.svg',
              '/ui-image/twitter.svg',
              '/ui-image/instagram.svg',
              '/ui-image/linkedin.svg',
              '/ui-image/github.svg',
            ]" 
          />
        </div>
        
        <!-- 左下角图表 -->
        <div class="chart-card bottom-left">
          <h2>产品与设备数量对比</h2>
          <div v-if="loading.stats" class="chart-loading">加载中...</div>
          <div v-else class="chart-container">
            <v-chart class="chart" :option="productDeviceOption" autoresize />
          </div>
        </div>
        
        <!-- 右下角图表 -->
        <div class="chart-card bottom-right">
          <h2>近7天设备增长趋势</h2>
          <div v-if="loading.stats" class="chart-loading">加载中...</div>
          <div v-else class="chart-container">
            <v-chart class="chart" :option="deviceGrowthOption" autoresize />
          </div>
        </div>
      </div>
      
      <!-- 最近使用区域 - 产品和设备 -->
      <div class="recent-section">
        <div class="recent-card">
          <h2>最近使用的产品</h2>
          <div v-if="loading.products" class="loading-state">
            <div class="loader"></div>
            <span>加载产品数据中...</span>
          </div>
          <div v-else-if="error.products" class="error-state">
            <p>{{ error.products }}</p>
            <button @click="fetchRecentProducts" class="btn-retry">重试</button>
          </div>
          <div v-else-if="recentProducts.length === 0" class="empty-state">
            暂无最近使用的产品
          </div>
          <div v-else class="recent-items">
            <div v-for="product in recentProducts.slice(0, 3)" :key="product.product_id" class="recent-item">
              <div class="item-info">
                <span class="item-name">{{ product.name || '未命名产品' }}</span>
                <span class="item-type">{{ getDeviceTypeName(product.device_type) }}</span>
              </div>
              <button @click="viewProductDetail(product.product_id)" class="btn-view">查看</button>
            </div>
          </div>
        </div>
        
        <div class="recent-card">
          <h2>最近使用的设备</h2>
          <div v-if="loading.devices" class="loading-state">
            <div class="loader"></div>
            <span>加载设备数据中...</span>
          </div>
          <div v-else-if="error.devices" class="error-state">
            <p>{{ error.devices }}</p>
            <button @click="fetchRecentDevices" class="btn-retry">重试</button>
          </div>
          <div v-else-if="recentDevices.length === 0" class="empty-state">
            暂无最近使用的设备
          </div>
          <div v-else class="recent-items">
            <div v-for="device in recentDevices.slice(0, 3)" :key="device.device_id" class="recent-item">
              <div class="item-info">
                <div class="name-container">
                  <span class="item-name">{{ device.device_id || '未知设备ID' }}</span>
                </div>
                <span :class="['status-badge', device.status === 'ONLINE' ? 'status-online' : 'status-offline']">
                  {{ device.status === 'ONLINE' ? '在线' : '离线' }}
                </span>
              </div>
              <button @click="viewDeviceDetail(device.device_id)" class="btn-view">查看</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { IconCloud } from './ui/index.js';
import BackGround from './ui/BackGround.vue';
import axios from 'axios';

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

export default {
  name: 'HomeView',
  components: {
    IconCloud,
    BackGround,
    VChart
  },
  data() {
    return {
      recentProducts: [],
      recentDevices: [],
      stats: {
        totalProducts: 0,
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        deviceTypeDistribution: {},
        deviceGrowthTrend: []
      },
      loading: {
        products: false,
        devices: false,
        stats: false
      },
      error: {
        products: null,
        devices: null,
        stats: null
      }
    }
  },
  computed: {
    // 设备状态饼图配置
    deviceStatusOption() {
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['在线设备', '离线设备']
        },
        series: [
          {
            name: '设备状态',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.stats.onlineDevices, name: '在线设备', itemStyle: { color: '#52c41a' } },
              { value: this.stats.offlineDevices, name: '离线设备', itemStyle: { color: '#ff4d4f' } }
            ]
          }
        ]
      };
    },
    // 设备类型分布图配置
    deviceTypeOption() {
      const data = Object.entries(this.stats.deviceTypeDistribution || {}).map(([name, value]) => {
        return { name, value };
      });
      
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '设备类型',
            type: 'pie',
            radius: '50%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    },
    // 产品设备对比图配置
    productDeviceOption() {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['数量']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['产品', '设备']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '数量',
            type: 'bar',
            data: [
              {
                value: this.stats.totalProducts,
                itemStyle: { color: '#1890ff' }
              },
              {
                value: this.stats.totalDevices,
                itemStyle: { color: '#722ed1' }
              }
            ],
            barWidth: '40%'
          }
        ]
      };
    },
    // 设备增长趋势图配置
    deviceGrowthOption() {
      const dates = this.stats.deviceGrowthTrend.map(item => item.date);
      const values = this.stats.deviceGrowthTrend.map(item => item.count);
      
      return {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: values,
            type: 'line',
            smooth: true,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(128, 90, 213, 0.6)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(128, 90, 213, 0.1)'
                  }
                ]
              }
            },
            itemStyle: {
              color: '#722ed1'
            }
          }
        ]
      };
    }
  },
  mounted() {
    this.fetchRecentProducts();
    this.fetchRecentDevices();
    this.fetchStats();
  },
  methods: {
    // 获取最近使用的产品
    async fetchRecentProducts() {
      this.loading.products = true;
      this.error.products = null;
      
      try {
        // 刷新云端数据并限制返回3个最新产品
        const response = await axios.get('/api/products?limit=3&refresh=true');
        if (response.data.success) {
          this.recentProducts = response.data.data || [];
          console.log('获取最近产品成功:', this.recentProducts.length);
        } else {
          throw new Error(response.data.message || '获取产品列表失败');
        }
      } catch (error) {
        console.error('获取最近产品错误:', error);
        this.error.products = error.response?.data?.message || error.message;
      } finally {
        this.loading.products = false;
      }
    },
    
    // 获取最近使用的设备
    async fetchRecentDevices() {
      this.loading.devices = true;
      this.error.devices = null;
      
      try {
        // 刷新云端数据并限制返回3个最新设备
        const response = await axios.get('/api/devices?limit=3&refresh=true');
        if (response.data.success) {
          this.recentDevices = response.data.devices || [];
          console.log('获取最近设备成功:', this.recentDevices.length);
          // 添加详细日志以检查设备数据结构
          if (this.recentDevices.length > 0) {
            console.log('设备数据示例:', JSON.stringify(this.recentDevices[0]));
            console.log('设备名称字段:', this.recentDevices[0].name);
          }
        } else {
          throw new Error(response.data.message || '获取设备列表失败');
        }
      } catch (error) {
        console.error('获取最近设备错误:', error);
        this.error.devices = error.response?.data?.message || error.message;
      } finally {
        this.loading.devices = false;
      }
    },
    
    // 查看产品详情
    viewProductDetail(productId) {
      this.$router.push(`/products`);
    },
    
    // 查看设备详情
    viewDeviceDetail(deviceId) {
      this.$router.push(`/devices`);
    },
    
    // 设备类型的中文名称
    getDeviceTypeName(deviceType) {
      const typeMap = {
        'WaterMeter': '水表',
        'Gateway': '网关',
        'Sensor': '传感器',
        'Camera': '摄像头',
        'Lock': '智能锁',
        'Light': '智能灯',
        'Others': '其他'
      }
      return typeMap[deviceType] || deviceType;
    },
    
    // 获取统计数据
    async fetchStats() {
      this.loading.stats = true;
      this.error.stats = null;
      
      try {
        // 获取产品总数
        const productsResponse = await axios.get('/api/products');
        if (productsResponse.data.success) {
          this.stats.totalProducts = productsResponse.data.data.length;
        }
        
        // 获取设备列表
        const devicesResponse = await axios.get('/api/devices');
        if (devicesResponse.data.success) {
          const devices = devicesResponse.data.devices || [];
          this.stats.totalDevices = devices.length;
          
          // 计算在线/离线设备数量
          this.stats.onlineDevices = devices.filter(d => d.status === 'ONLINE').length;
          this.stats.offlineDevices = devices.filter(d => d.status !== 'ONLINE').length;
          
          // 计算设备类型分布
          this.stats.deviceTypeDistribution = this.calculateDeviceTypes(devices);
          
          // 模拟生成近7天增长趋势数据
          this.stats.deviceGrowthTrend = this.generateGrowthTrendData();
        }
      } catch (error) {
        console.error('获取统计数据错误:', error);
        this.error.stats = error.response?.data?.message || error.message;
      } finally {
        this.loading.stats = false;
      }
    },
    
    // 计算设备类型分布
    calculateDeviceTypes(devices) {
      const typeCounts = {};
      const typeMap = {
        'WaterMeter': '水表',
        'Gateway': '网关',
        'Sensor': '传感器',
        'Camera': '摄像头',
        'Lock': '智能锁',
        'Light': '智能灯',
        'Others': '其他'
      };
      
      devices.forEach(device => {
        const type = device.device_type || 'Others';
        const displayName = typeMap[type] || type;
        typeCounts[displayName] = (typeCounts[displayName] || 0) + 1;
      });
      
      return typeCounts;
    },
    
    // 生成近7天增长趋势数据（模拟数据）
    generateGrowthTrendData() {
      const data = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // 格式化日期为 MM-DD 格式
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        // 生成一个随机增长值（基于设备总数）
        const baseValue = this.stats.totalDevices / 10;
        const randomGrowth = Math.floor(Math.random() * baseValue);
        const count = Math.max(0, this.stats.totalDevices - randomGrowth * (i + 1));
        
        data.push({
          date: formattedDate,
          count: count
        });
      }
      
      return data;
    }
  }
}
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* 背景组件样式 */
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: #2c3e50;
  background-color: rgba(247, 249, 252, 0.75);
  min-height: 100vh;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  position: relative;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 新的仪表盘布局 - 五个区域 */
.dashboard-layout {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1.8rem;
  height: 700px;
  margin-bottom: 2rem;
}

/* 四个角落的图表卡片 */
.chart-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(114, 46, 209, 0.12);
}

.chart-card h2 {
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: #2c3e50;
  font-weight: 600;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  position: relative;
}

.chart-card h2::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #722ed1, rgba(114, 46, 209, 0.5));
  border-radius: 3px;
}

/* 中间的圆形区域 */
.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(114, 46, 209, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  overflow: hidden;
  border: 8px solid rgba(114, 46, 209, 0.05);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.center-circle::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(114, 46, 209, 0.05) 0%, transparent 70%);
  animation: pulse 15s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.6; }
}

.icon-cloud {
  width: 90%;
  height: 90%;
  z-index: 3;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

.chart-container {
  flex-grow: 1;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
  transition: opacity 0.5s ease;
}

.chart-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1rem;
  background: rgba(247, 249, 252, 0.7);
  border-radius: 8px;
  flex-grow: 1;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.stat-card::after {
  content: '';
  position: absolute;
  height: 4px;
  width: 100%;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(114, 46, 209, 0.3), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(114, 46, 209, 0.15);
}

.stat-card:hover::after {
  transform: translateX(100%);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 1.25rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-size: 150% 150%;
  animation: gradientAnimation 5s ease infinite;
}

@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.product-icon {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(24, 144, 255, 0.05) 100%);
  color: #1890ff;
}

.device-icon {
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.15) 0%, rgba(114, 46, 209, 0.05) 100%);
  color: #722ed1;
}

.online-icon {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.15) 0%, rgba(82, 196, 26, 0.05) 100%);
  color: #52c41a;
}

.offline-icon {
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.15) 0%, rgba(255, 77, 79, 0.05) 100%);
  color: #ff4d4f;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #8c8c8c;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0.3rem 0 0 0;
  background: linear-gradient(to right, #2c3e50, #4a5568);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 最近使用区域样式 */
.recent-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8rem;
}

.recent-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.recent-card:hover {
  box-shadow: 0 15px 35px rgba(114, 46, 209, 0.12);
}

.recent-card::before {
  content: '';
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(114, 46, 209, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  top: -50px;
  right: -50px;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  color: #2c3e50;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  font-weight: 600;
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #722ed1, rgba(114, 46, 209, 0.5));
  border-radius: 3px;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #8c8c8c;
  font-size: 0.95rem;
  background-color: rgba(247, 249, 252, 0.8);
  border-radius: 12px;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed rgba(114, 46, 209, 0.2);
}

.recent-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background-color: rgba(247, 249, 252, 0.8);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 3px solid transparent;
}

.recent-item:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  border-left: 3px solid #722ed1;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.name-container {
  margin-bottom: 0.3rem;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-name {
  font-weight: 600;
  color: #2c3e50;
  display: block;
  font-size: 0.95rem;
}

.item-type {
  font-size: 0.8rem;
  color: #8c8c8c;
  font-weight: 500;
}

.status-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  display: inline-block;
  margin-top: 0.4rem;
  font-weight: 500;
}

.status-online {
  background-color: rgba(82, 196, 26, 0.15);
  color: #52c41a;
}

.status-offline {
  background-color: rgba(255, 77, 79, 0.15);
  color: #ff4d4f;
}

.btn-view {
  background: linear-gradient(135deg, #722ed1 0%, #7b40e0 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.2px;
  box-shadow: 0 4px 10px rgba(114, 46, 209, 0.2);
}

.btn-view:hover {
  background: linear-gradient(135deg, #6423b9 0%, #6e35c9 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(114, 46, 209, 0.3);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #8c8c8c;
  flex: 1;
  background: rgba(247, 249, 252, 0.7);
  border-radius: 12px;
}

.loader {
  border: 3px solid rgba(114, 46, 209, 0.1);
  border-top: 3px solid #722ed1;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.8rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  background-color: rgba(255, 77, 79, 0.07);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 0.5rem;
  color: #ff4d4f;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.btn-retry {
  background: linear-gradient(135deg, #1890ff 0%, #3ba0ff 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.2);
}

.btn-retry:hover {
  background: linear-gradient(135deg, #0e80f2 0%, #2b90ed 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(24, 144, 255, 0.3);
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-section {
    grid-template-columns: 1fr;
  }
  
  .dashboard-layout {
    height: auto;
    display: flex;
    flex-direction: column;
  }
  
  .center-circle {
    position: relative;
    transform: none;
    top: auto;
    left: auto;
    width: 100%;
    height: 300px;
    border-radius: 16px;
    margin: 1rem auto;
    order: -1;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .center-circle {
    height: 250px;
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .home-container {
    padding: 1rem;
  }
  
  .chart-card,
  .recent-card {
    padding: 1.25rem;
  }
  
  .stat-card {
    padding: 1.25rem;
  }
  
  .center-circle {
    height: 200px;
  }
}
</style> 