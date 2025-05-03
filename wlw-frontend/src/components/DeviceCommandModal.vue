<template>
  <teleport to="body">
    <div v-if="visible" class="modal">
      <div class="modal-content command-modal">
        <span class="close-btn" @click="closeModal">&times;</span>
        <h2>设备命令控制</h2>
        <div v-if="device" class="command-detail-container">
          <div class="command-header">
            <h3>{{ device.device_name }}</h3>
            <span :class="['status-badge', device.status === 'ONLINE' ? 'status-online' : 'status-offline']">
              {{ device.status === 'ONLINE' ? '在线' : '离线' }}
            </span>
          </div>
          
          <!-- 添加报警记录显示区域 -->
          <div v-if="alerts.length > 0" class="alerts-container">
            <div class="alert-header">
              <h3>报警记录</h3>
              <button class="btn btn-small btn-clear" @click="clearAlerts">清除记录</button>
            </div>
            <div class="alert-list">
              <div v-for="(alert, index) in alerts" :key="index" class="alert-item" :class="alert.type">
                <div class="alert-time">{{ formatTime(alert.time) }}</div>
                <div class="alert-content">
                  <span class="alert-icon">{{ alert.type === 'warning' ? '⚠️' : '🚨' }}</span>
                  {{ alert.message }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="service-selector">
            <div class="form-group">
              <label>选择服务:</label>
              <select v-model="selectedServiceId" @change="handleServiceChange" class="service-select">
                <option value="">请选择服务</option>
                <option v-for="service in availableServices" :key="service" :value="service">
                  {{ service }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>或输入服务ID:</label>
              <div class="input-group">
                <input 
                  type="text" 
                  v-model="customServiceId" 
                  placeholder="请输入服务ID" 
                  class="service-input"
                  @keyup.enter="handleCustomService"
                />
                <button 
                  class="btn btn-small btn-query" 
                  @click="handleCustomService"
                  :disabled="!customServiceId"
                >
                  查询
                </button>
              </div>
            </div>
          </div>
          
          <div class="command-content">
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="error" class="error-message">
              {{ error }}
            </div>
            <div v-else-if="deviceProperties && deviceProperties.services && deviceProperties.services.length > 0" class="property-list">
              <div v-for="(service, serviceIndex) in deviceProperties.services" :key="serviceIndex" class="service-card">
                <h3>{{ service.service_id }}</h3>
                <table class="property-table">
                  <thead>
                    <tr>
                      <th>属性名称</th>
                      <th>当前值</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(value, key) in service.properties" :key="key">
                      <td>{{ key }}</td>
                      <td>
                        <div class="property-value">
                          <span :class="{'value-warning': isValueWarning(service.service_id, key, value)}">
                            {{ value }}
                          </span>
                          <button 
                            class="btn btn-small btn-monitor" 
                            @click="openMonitorModal(service.service_id, key, value)"
                            :title="getMonitorStatus(service.service_id, key)"
                          >
                            {{ getMonitorStatus(service.service_id, key) ? '监控中' : '设置监控' }}
                          </button>
                        </div>
                      </td>
                      <td>
                        <button 
                          class="btn btn-small" 
                          @click="openSetValueModal(service.service_id, key, value)"
                        >
                          设置
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="no-data">
              没有可用的属性数据
            </div>
          </div>
          
          <div class="command-actions">
            <button @click="refreshData" class="form-btn btn-refresh" :disabled="loading">
              <span class="icon">⟳</span> {{ loading ? '刷新中...' : '刷新数据' }}
            </button>
            <button @click="closeModal" class="form-btn btn-close">
              <span class="icon">✖</span> 关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置属性值模态框 -->
    <teleport to="body">
      <div v-if="setValueModalVisible" class="modal">
        <div class="modal-content">
          <span class="close-btn" @click="closeSetValueModal">&times;</span>
          <h2>设置属性值</h2>
          <div class="form-group">
            <label>服务:</label>
            <input type="text" v-model="setValueForm.serviceId" readonly />
          </div>
          <div class="form-group">
            <label>属性名称:</label>
            <input type="text" v-model="setValueForm.propertyName" readonly />
          </div>
          <div class="form-group">
            <label>当前值:</label>
            <input type="text" v-model="setValueForm.currentValue" readonly />
          </div>
          <div class="form-group">
            <label>新值:</label>
            <input type="text" v-model="setValueForm.newValue" />
          </div>
          <div class="form-actions">
            <button @click="closeSetValueModal" class="form-btn btn-cancel">取消</button>
            <button @click="sendSetValueCommand" class="form-btn btn-submit">发送命令</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 添加监控设置模态框 -->
    <teleport to="body">
      <div v-if="monitorModalVisible" class="modal">
        <div class="modal-content">
          <span class="close-btn" @click="closeMonitorModal">&times;</span>
          <h2>设置属性监控</h2>
          <div class="form-group">
            <label>服务:</label>
            <input type="text" v-model="monitorForm.serviceId" readonly />
          </div>
          <div class="form-group">
            <label>属性名称:</label>
            <input type="text" v-model="monitorForm.propertyName" readonly />
          </div>
          <div class="form-group">
            <label>当前值:</label>
            <input type="text" v-model="monitorForm.currentValue" readonly />
          </div>
          <div class="form-group">
            <label>监控类型:</label>
            <select v-model="monitorForm.type" class="monitor-select">
              <option value="max">超过最大值报警</option>
              <option value="min">低于最小值报警</option>
              <option value="range">超出范围报警</option>
            </select>
          </div>
          <div class="form-group" v-if="monitorForm.type !== 'range'">
            <label>{{ monitorForm.type === 'max' ? '最大值' : '最小值' }}:</label>
            <input type="number" v-model="monitorForm.threshold" />
          </div>
          <div class="form-group" v-else>
            <label>最小值:</label>
            <input type="number" v-model="monitorForm.minValue" />
            <label>最大值:</label>
            <input type="number" v-model="monitorForm.maxValue" />
          </div>
          <div class="form-actions">
            <button @click="closeMonitorModal" class="form-btn btn-cancel">取消</button>
            <button @click="saveMonitor" class="form-btn btn-submit">保存</button>
          </div>
        </div>
      </div>
    </teleport>
  </teleport>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DeviceCommandModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    device: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      deviceProperties: null,
      setValueModalVisible: false,
      setValueForm: {
        serviceId: '',
        propertyName: '',
        currentValue: '',
        newValue: ''
      },
      selectedServiceId: '',
      customServiceId: '',
      availableServices: [
        'smokeDetector',
        'WaterMeterBasic',
        'Temperature',
        'Humidity'
        // 这里可以添加更多的服务ID
      ],
      refreshTimer: null,
      // 添加属性监控配置
      propertyMonitors: {},
      // 添加报警记录
      alerts: [],
      monitorModalVisible: false,
      monitorForm: {
        serviceId: '',
        propertyName: '',
        currentValue: '',
        type: 'max',
        threshold: '',
        minValue: '',
        maxValue: ''
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.device) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    }
  },
  beforeUnmount() {
    this.stopAutoRefresh()
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    handleCustomService() {
      if (this.customServiceId) {
        this.selectedServiceId = this.customServiceId
        this.handleServiceChange()
      }
    },
    
    handleServiceChange() {
      if (this.selectedServiceId && this.device) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },
    
    startAutoRefresh() {
      // 先清除可能存在的定时器
      this.stopAutoRefresh()
      // 立即执行一次刷新
      this.fetchDeviceProperties(this.device.device_id)
      // 设置定时器，每2秒刷新一次
      this.refreshTimer = setInterval(() => {
        if (this.selectedServiceId && this.device) {
          // 保存当前滚动位置
          const modalContent = document.querySelector('.command-modal')
          const scrollPosition = modalContent ? modalContent.scrollTop : 0
          
          this.fetchDeviceProperties(this.device.device_id).then(() => {
            // 恢复滚动位置
            if (modalContent) {
              modalContent.scrollTop = scrollPosition
            }
          })
        }
      }, 2000)
    },
    
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    
    async fetchDeviceProperties(deviceId) {
      if (!this.selectedServiceId) {
        this.error = '请先选择服务'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/device-properties/${deviceId}?serviceId=${this.selectedServiceId}`)
        if (response.data.success) {
          this.deviceProperties = response.data.data.response
        } else {
          this.error = response.data.message || '获取设备属性失败'
        }
      } catch (error) {
        console.error('获取设备属性失败:', error)
        this.error = error.response?.data?.message || '获取设备属性失败'
      } finally {
        this.loading = false
      }
    },
    
    async refreshData() {
      if (this.device) {
        await this.fetchDeviceProperties(this.device.device_id)
      }
    },
    
    openSetValueModal(serviceId, propertyName, currentValue) {
      this.setValueForm = {
        serviceId: serviceId,
        propertyName: propertyName,
        currentValue: currentValue,
        newValue: currentValue
      }
      this.setValueModalVisible = true
    },
    
    closeSetValueModal() {
      this.setValueModalVisible = false
    },
    
    sendSetValueCommand() {
      // 这里实现命令发送逻辑
      alert(`命令发送功能暂未实现。\n服务：${this.setValueForm.serviceId}\n属性：${this.setValueForm.propertyName}\n新值：${this.setValueForm.newValue}`)
      this.closeSetValueModal()
      // 后续可以实现真正的命令发送API调用
    },
    
    openMonitorModal(serviceId, propertyName, currentValue) {
      this.monitorForm = {
        serviceId,
        propertyName,
        currentValue,
        type: 'max',
        threshold: '',
        minValue: '',
        maxValue: ''
      }
      this.monitorModalVisible = true
    },
    
    closeMonitorModal() {
      this.monitorModalVisible = false
    },
    
    saveMonitor() {
      const key = `${this.monitorForm.serviceId}_${this.monitorForm.propertyName}`
      this.propertyMonitors[key] = {
        ...this.monitorForm,
        enabled: true
      }
      this.closeMonitorModal()
    },
    
    getMonitorStatus(serviceId, propertyName) {
      const key = `${serviceId}_${propertyName}`
      return this.propertyMonitors[key]?.enabled || false
    },
    
    isValueWarning(serviceId, propertyName, value) {
      const key = `${serviceId}_${propertyName}`
      const monitor = this.propertyMonitors[key]
      if (!monitor || !monitor.enabled) return false
      
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return false
      
      if (monitor.type === 'max' && numValue > parseFloat(monitor.threshold)) {
        this.addAlert('warning', `${propertyName} 超过设定值 ${monitor.threshold}`)
        return true
      }
      if (monitor.type === 'min' && numValue < parseFloat(monitor.threshold)) {
        this.addAlert('warning', `${propertyName} 低于设定值 ${monitor.threshold}`)
        return true
      }
      if (monitor.type === 'range' && 
          (numValue < parseFloat(monitor.minValue) || numValue > parseFloat(monitor.maxValue))) {
        this.addAlert('warning', `${propertyName} 超出范围 [${monitor.minValue}, ${monitor.maxValue}]`)
        return true
      }
      return false
    },
    
    addAlert(type, message) {
      // 检查是否已经存在相同的报警
      const isDuplicate = this.alerts.some(alert => 
        alert.message === message && 
        (Date.now() - alert.time) < 5000 // 5秒内的相同报警视为重复
      )
      
      if (!isDuplicate) {
        this.alerts.unshift({
          type,
          message,
          time: Date.now()
        })
        
        // 限制报警记录数量
        if (this.alerts.length > 50) {
          this.alerts.pop()
        }
        
        // 播放提示音
        this.playAlertSound()
      }
    },
    
    clearAlerts() {
      this.alerts = []
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },
    
    playAlertSound() {
      const audio = new Audio('/alert.mp3') // 需要准备一个提示音文件
      audio.play().catch(e => console.error('播放提示音失败:', e))
    }
  }
}
</script>

<style scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  padding: 2.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(24, 144, 255, 0.15);
  position: relative;
  animation: slideUp 0.4s ease forwards;
  border: 1px solid rgba(24, 144, 255, 0.1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
}

.command-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 1.5rem;
  cursor: pointer;
  color: #8c8c8c;
  transition: color 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.03);
}

.close-btn:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
}

.command-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1890ff;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-online {
  background: linear-gradient(135deg, #d4f7e2 0%, #a7f0c1 100%);
  color: #0e8a43;
}

.status-offline {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  color: #cf1322;
}

.service-selector {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.service-select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: white;
  cursor: pointer;
}

.service-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.service-select option {
  padding: 0.8rem;
}

.command-content {
  background-color: rgba(245, 245, 250, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(24, 144, 255, 0.05);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #1890ff;
  position: relative;
}

.loading::after {
  content: '';
  display: block;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  margin: 10px auto 0;
  animation: loadingPulse 1.5s infinite ease-in-out;
}

@keyframes loadingPulse {
  0% { width: 50px; opacity: 0.3; }
  50% { width: 150px; opacity: 1; }
  100% { width: 50px; opacity: 0.3; }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #f5222d;
  border: 1px solid rgba(245, 34, 45, 0.2);
  border-radius: 8px;
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 10%);
}

.service-card {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.service-card h3 {
  margin: 0 0 1rem 0;
  color: #595959;
  font-size: 1.1rem;
}

.property-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
}

.property-table th, .property-table td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.property-table th {
  background-color: #fafafa;
  font-weight: 500;
  color: #595959;
}

.property-table tr:hover {
  background-color: #fafafa;
}

.command-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  gap: 1rem;
}

.form-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-refresh {
  background: linear-gradient(90deg, #52c41a, #389e0d);
  color: white;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(82, 196, 26, 0.3);
}

.btn-refresh:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-close {
  background: linear-gradient(90deg, #ff4d4f, #cf1322);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 34, 45, 0.2);
}

.btn-close:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(245, 34, 45, 0.3);
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  background: #1890ff;
  color: white;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background: #096dd9;
  transform: translateY(-2px);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #595959;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-group input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  background: #f5f5f5;
  color: #595959;
}

.btn-cancel:hover {
  background: #f0f0f0;
}

.btn-submit {
  background: linear-gradient(90deg, #1890ff, #096dd9);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.service-input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.service-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.btn-query {
  background: linear-gradient(90deg, #1890ff, #096dd9);
  color: white;
  min-width: 80px;
}

.btn-query:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.alerts-container {
  margin-bottom: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.alert-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #595959;
}

.alert-list {
  max-height: 200px;
  overflow-y: auto;
}

.alert-item {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-item.warning {
  background-color: #fffbe6;
}

.alert-item.danger {
  background-color: #fff1f0;
}

.alert-time {
  color: #8c8c8c;
  font-size: 0.85rem;
  min-width: 80px;
}

.alert-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-icon {
  font-size: 1.2rem;
}

.property-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.value-warning {
  color: #f5222d;
  font-weight: 500;
}

.btn-monitor {
  background: linear-gradient(90deg, #722ed1, #531dab);
  color: white;
}

.btn-monitor:hover {
  background: linear-gradient(90deg, #531dab, #391085);
}

.btn-clear {
  background: #f5f5f5;
  color: #595959;
}

.monitor-select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: white;
  cursor: pointer;
}

.monitor-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}
</style> 