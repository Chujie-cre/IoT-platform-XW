<template>
  <div class="device-create">
    <h2>创建新设备</h2>
    
    <!-- 成功消息 -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
      <div v-if="createdDeviceInfo" class="device-credentials">
        <p><strong>设备ID:</strong> {{ createdDeviceInfo.device_id }}</p>
        <p><strong>节点ID:</strong> {{ createdDeviceInfo.node_id }}</p>
        <p v-if="createdDeviceInfo.secret"><strong>设备密钥:</strong> {{ createdDeviceInfo.secret }}</p>
        <p class="warning-text">请保存好设备密钥，它只会显示一次！</p>
      </div>
    </div>
    
    <!-- 错误消息 -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="errorMessage = ''" class="btn btn-small">关闭</button>
    </div>
    
    <!-- 创建设备表单 -->
    <form @submit.prevent="createDevice" class="create-form">
      <div class="form-group">
        <label for="device_name">设备名称 <span class="required">*</span></label>
        <input 
          type="text" 
          id="device_name" 
          v-model="form.device_name" 
          required
          placeholder="请输入设备名称"
          class="form-control"
        />
        <small>设备名称用于标识设备，必须唯一</small>
      </div>
      
      <div class="form-group">
        <label for="node_id">设备ID</label>
        <input 
          type="text" 
          id="node_id" 
          v-model="form.node_id"
          placeholder="可选，留空系统将自动生成" 
          class="form-control"
          :class="{ 'invalid': !isValidNodeId && form.node_id }"
          @input="validateNodeId"
        />
        <small :class="{ 'error-text': !isValidNodeId && form.node_id }">
          设备ID只能包含英文字母、数字、冒号、下划线和连字符，长度在1到64之间
        </small>
      </div>
      
      <div class="form-group">
        <label for="product_id">产品ID <span class="required">*</span></label>
        <input 
          type="text" 
          id="product_id" 
          v-model="form.product_id" 
          required
          placeholder="请输入产品ID"
          class="form-control"
        />
        <small>产品ID用于关联设备与产品模型</small>
      </div>
      
      <div class="form-group">
        <label for="project_id">项目ID <span class="required">*</span></label>
        <input 
          type="text" 
          id="project_id" 
          v-model="form.project_id" 
          required
          placeholder="请输入项目ID"
          class="form-control"
        />
        <small>华为云IoT平台的项目ID</small>
      </div>
      
      <div class="form-group">
        <label for="instance_id">实例ID <span class="required">*</span></label>
        <input 
          type="text" 
          id="instance_id" 
          v-model="form.instance_id" 
          required
          placeholder="请输入实例ID"
          class="form-control"
        />
        <small>华为云IoT平台的实例ID</small>
      </div>
      
      <div class="form-group">
        <label for="app_id">应用ID <span class="required">*</span></label>
        <input 
          type="text" 
          id="app_id" 
          v-model="form.app_id" 
          required
          placeholder="请输入应用ID"
          class="form-control"
        />
        <small>华为云IoT平台的应用ID</small>
      </div>
      
      <div class="form-group">
        <label for="description">设备描述</label>
        <textarea 
          id="description" 
          v-model="form.description"
          placeholder="请输入设备描述信息" 
          class="form-control"
          rows="3"
        ></textarea>
        <small>设备描述信息，用于说明设备用途等</small>
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading || (form.node_id && !isValidNodeId)"
        >
          {{ loading ? '创建中...' : '创建设备' }}
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
  name: 'DeviceCreate',
  data() {
    return {
      form: {
        device_name: '',
        node_id: '',
        product_id: '',
        project_id: '',
        instance_id: '',
        app_id: '',
        description: ''
      },
      isValidNodeId: true,
      loading: false,
      successMessage: '',
      errorMessage: '',
      createdDeviceInfo: null
    }
  },
  methods: {
    validateNodeId() {
      // 验证设备ID是否符合格式要求
      if (!this.form.node_id) {
        this.isValidNodeId = true;
        return;
      }
      
      const nodeIdRegex = /^[a-zA-Z0-9:_-]{1,64}$/;
      this.isValidNodeId = nodeIdRegex.test(this.form.node_id);
    },
    
    async createDevice() {
      // 如果设备ID不为空，验证其格式
      if (this.form.node_id && !this.isValidNodeId) {
        this.errorMessage = '设备ID格式不正确，只能包含英文字母、数字、冒号、下划线和连字符，长度在1到64之间';
        return;
      }
      
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      try {
        // 发送创建设备请求
        const response = await axios.post('/api/devices', this.form);
        
        if (response.data.success) {
          this.successMessage = `设备 "${this.form.device_name}" 创建成功!`;
          this.createdDeviceInfo = response.data.device;
          this.resetForm();
          // 触发事件通知父组件设备创建成功
          this.$emit('device-created', response.data.device);
        } else {
          throw new Error(response.data.message || '创建设备失败');
        }
      } catch (error) {
        console.error('创建设备错误:', error);
        // 处理API返回的错误信息
        const errorData = error.response?.data;
        
        if (errorData?.suggestedNodeId) {
          this.errorMessage = `${errorData.message || '创建设备失败'}\n建议使用设备ID: ${errorData.suggestedNodeId}`;
        } else {
          this.errorMessage = errorData?.message || error.message || '创建设备时发生错误';
        }
      } finally {
        this.loading = false;
      }
    },
    
    resetForm() {
      this.form = {
        device_name: '',
        node_id: '',
        product_id: '',
        project_id: '',
        instance_id: '',
        app_id: '',
        description: ''
      };
      this.isValidNodeId = true;
      this.createdDeviceInfo = null;
    }
  }
}
</script>

<style scoped>
.device-create {
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

.form-control.invalid {
  border-color: #f56c6c;
}

.form-control:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-control.invalid:focus {
  border-color: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

small {
  color: #909399;
  font-size: 0.75rem;
}

.error-text {
  color: #f56c6c;
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
  transition: all 0.3s;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f4f4f5;
  color: #606266;
}

.btn-cancel:hover {
  background-color: #e9e9eb;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.success-message {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #67c23a;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #f56c6c;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-credentials {
  background-color: #f0f9eb;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #67c23a;
}

.device-credentials p {
  margin: 0.5rem 0;
}

.warning-text {
  color: #f56c6c;
  font-size: 0.8rem;
}
</style> 