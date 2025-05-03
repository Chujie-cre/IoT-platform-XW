<template>
  <div class="product-detail" v-if="product">
    <div class="detail-header">
      <div class="title-section">
        <h2>{{ product.name }}</h2>
        <span class="product-type">{{ getDeviceTypeName(product.device_type) }}</span>
      </div>
      <button @click="close" class="btn btn-close">返回</button>
    </div>
    
    <!-- 产品基本信息 -->
    <div class="info-card">
      <h3>基本信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">产品ID</span>
          <span class="value">{{ product.product_id }}</span>
        </div>
        <div class="info-item">
          <span class="label">设备类型</span>
          <span class="value">{{ getDeviceTypeName(product.device_type) }}</span>
        </div>
        <div class="info-item">
          <span class="label">协议类型</span>
          <span class="value">{{ product.protocol_type }}</span>
        </div>
        <div class="info-item">
          <span class="label">数据格式</span>
          <span class="value">{{ product.data_format }}</span>
        </div>
        <div class="info-item">
          <span class="label">厂商名称</span>
          <span class="value">{{ product.manufacturer_name || '未设置' }}</span>
        </div>
        <div class="info-item">
          <span class="label">行业</span>
          <span class="value">{{ getIndustryName(product.industry) }}</span>
        </div>
        <div class="info-item">
          <span class="label">服务类型</span>
          <span class="value">{{ product.service_type }}</span>
        </div>
        <div class="info-item">
          <span class="label">服务ID</span>
          <span class="value">{{ product.service_id || '未设置' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 产品描述 -->
    <div class="info-card" v-if="product.description">
      <h3>产品描述</h3>
      <p class="description">{{ product.description }}</p>
    </div>
    
    <!-- 产品关联设备 -->
    <div class="info-card">
      <h3>关联设备</h3>
      <div v-if="loading" class="loading-devices">
        正在加载设备列表...
      </div>
      <div v-else-if="devices.length === 0" class="no-devices">
        暂无关联设备
      </div>
      <div v-else class="device-list">
        <div v-for="device in devices" :key="device.device_id" class="device-item">
          <div class="device-info">
            <span class="device-name">{{ device.device_name }}</span>
            <span :class="['device-status', device.status === 'ONLINE' ? 'status-online' : 'status-offline']">
              {{ device.status === 'ONLINE' ? '在线' : '离线' }}
            </span>
          </div>
          <span class="device-id">{{ device.device_id }}</span>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button @click="openEditModal" class="btn btn-edit">编辑产品</button>
      <button @click="confirmDelete" class="btn btn-delete">删除产品</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProductDetail',
  props: {
    productId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      product: null,
      devices: [],
      loading: false,
      error: null
    }
  },
  watch: {
    productId: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.fetchProductDetails(newValue);
          this.fetchRelatedDevices(newValue);
        }
      }
    }
  },
  methods: {
    // 获取产品详情
    async fetchProductDetails(productId) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`/api/products/${productId}`);
        
        if (response.data.success) {
          this.product = response.data.data;
        } else {
          throw new Error(response.data.message || '获取产品详情失败');
        }
      } catch (error) {
        console.error('获取产品详情错误:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取关联设备
    async fetchRelatedDevices(productId) {
      this.loading = true;
      
      try {
        const response = await axios.get(`/api/devices`);
        
        if (response.data.success) {
          // 筛选出与当前产品ID匹配的设备
          this.devices = (response.data.devices || []).filter(device => device.product_id === productId);
        } else {
          this.devices = [];
        }
      } catch (error) {
        console.error('获取关联设备错误:', error);
        this.devices = [];
      } finally {
        this.loading = false;
      }
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
    
    // 获取行业中文名称
    getIndustryName(industry) {
      const industryMap = {
        'WaterConservancy': '水利',
        'Agriculture': '农业',
        'Environment': '环保',
        'Manufacturing': '制造业',
        'Electric': '电力',
        'SmartCity': '智慧城市',
        'Other': '其他'
      }
      return industryMap[industry] || industry || '未设置';
    },
    
    // 返回产品列表
    close() {
      this.$emit('close');
    },
    
    // 打开编辑模态框
    openEditModal() {
      this.$emit('edit', this.product);
    },
    
    // 确认删除
    confirmDelete() {
      this.$emit('delete', this.product);
    }
  }
}
</script>

<style scoped>
.product-detail {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-section h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.product-type {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  background-color: #e6f7ff;
  color: #1890ff;
}

.btn-close {
  background-color: #f5f5f5;
  color: #666;
}

.btn-close:hover {
  background-color: #e6e6e6;
}

.info-card {
  background-color: #fafafa;
  border-radius: 6px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.value {
  font-size: 1rem;
  color: #333;
}

.description {
  line-height: 1.5;
  color: #333;
  white-space: pre-line;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0.8rem 1rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.device-name {
  font-weight: 500;
}

.device-id {
  color: #888;
  font-size: 0.85rem;
}

.device-status {
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
}

.status-online {
  background-color: #d4f7e2;
  color: #13a452;
}

.status-offline {
  background-color: #fff1f0;
  color: #f5222d;
}

.no-devices, .loading-devices {
  text-align: center;
  padding: 1.5rem;
  color: #999;
  background-color: white;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
  transition: background-color 0.3s;
}

.btn-edit {
  background-color: #faad14;
  color: white;
}

.btn-edit:hover {
  background-color: #ffc53d;
}

.btn-delete {
  background-color: #f5f5f5;
  color: #ff4d4f;
}

.btn-delete:hover {
  background-color: #fff1f0;
  color: #ff7875;
}
</style> 