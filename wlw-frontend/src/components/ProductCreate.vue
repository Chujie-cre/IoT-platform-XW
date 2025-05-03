<template>
  <div class="product-create">
    <h2>创建新产品</h2>
    
    <!-- 错误消息 -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="errorMessage = ''" class="btn btn-small">关闭</button>
    </div>
    
    <!-- 创建产品表单 -->
    <form @submit.prevent="createProduct" class="create-form">
      <div class="form-group">
        <label for="name">产品名称 <span class="required">*</span></label>
        <input 
          type="text" 
          id="name" 
          v-model="form.name" 
          required
          placeholder="请输入产品名称"
          class="form-control"
        />
        <small>产品名称用于标识产品，例如"智能水表"</small>
      </div>
      
      <div class="form-group">
        <label for="device_type">设备类型</label>
        <select 
          id="device_type" 
          v-model="form.device_type"
          class="form-control"
        >
          <option value="测试">测试</option>
          <option value="WaterMeter">水表</option>
          <option value="Gateway">网关</option>
          <option value="Sensor">传感器</option>
          <option value="Camera">摄像头</option>
          <option value="Lock">智能锁</option>
          <option value="Light">智能灯</option>
          <option value="Others">其他</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="protocol_type">协议类型</label>
        <select 
          id="protocol_type" 
          v-model="form.protocol_type"
          class="form-control"
        >
          <option value="MQTT">MQTT</option>
          <option value="CoAP">CoAP</option>
          <option value="HTTP">HTTP</option>
          <option value="LwM2M">LwM2M</option>
          <option value="Modbus">Modbus</option>
          <option value="OPC-UA">OPC-UA</option>
          <option value="TCP">TCP</option>
          <option value="Custom">自定义</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="data_format">数据格式</label>
        <select 
          id="data_format" 
          v-model="form.data_format"
          class="form-control"
        >
          <option value="json">JSON</option>
          <option value="binary">二进制</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="manufacturer_name">厂商名称</label>
        <input 
          type="text" 
          id="manufacturer_name" 
          v-model="form.manufacturer_name" 
          placeholder="请输入厂商名称"
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="industry">所属行业</label>
        <select 
          id="industry" 
          v-model="form.industry"
          class="form-control"
        >
          <option value="WaterConservancy">水利</option>
          <option value="Agriculture">农业</option>
          <option value="Environment">环保</option>
          <option value="Manufacturing">制造业</option>
          <option value="Electric">电力</option>
          <option value="SmartCity">智慧城市</option>
          <option value="Other">其他</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="service_type">服务类型</label>
        <select 
          id="service_type" 
          v-model="form.service_type"
          class="form-control"
        >
          <option value="家电">家电</option>
          <option value="default">默认服务</option>
          <option value="sensor">传感器</option>
          <option value="gateway">网关</option>
          <option value="camera">摄像头</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="service_id">服务ID</label>
        <input 
          type="text" 
          id="service_id" 
          v-model="form.service_id" 
          placeholder="请输入服务ID"
          class="form-control"
        />
      </div>
      
      <div class="form-group">
        <label for="description">产品描述</label>
        <textarea 
          id="description" 
          v-model="form.description"
          placeholder="请输入产品描述信息" 
          class="form-control"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading"
        >
          {{ loading ? '创建中...' : '创建产品' }}
        </button>
        <button 
          type="button" 
          class="btn btn-cancel" 
          @click="resetForm"
          :disabled="loading"
        >
          重置
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProductCreate',
  data() {
    return {
      form: {
        name: '',
        device_type: '',
        protocol_type: 'MQTT',
        data_format: 'json',
        manufacturer_name: '',
        industry: '',
        description: '',
        service_type: '家电',
        service_id: ''
      },
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async createProduct() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        // 发送创建产品请求
        const response = await axios.post('/api/products', this.form);
        
        if (response.data.success) {
          this.resetForm();
          // 触发事件通知父组件产品创建成功
          this.$emit('product-created', response.data.data);
        } else {
          throw new Error(response.data.message || '创建产品失败');
        }
      } catch (error) {
        console.error('创建产品错误:', error);
        // 处理API返回的错误信息
        const errorData = error.response?.data;
        this.errorMessage = errorData?.message || error.message || '创建产品时发生错误';
      } finally {
        this.loading = false;
      }
    },
    
    resetForm() {
      this.form = {
        name: '',
        device_type: '',
        protocol_type: 'MQTT',
        data_format: 'json',
        manufacturer_name: '',
        industry: '',
        description: '',
        service_type: '家电',
        service_id: ''
      };
    }
  }
}
</script>

<style scoped>
.product-create {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.required {
  color: #f56c6c;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

small {
  color: #909399;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #e6e6e6;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 3px solid #f56c6c;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  margin: 0;
}
</style> 