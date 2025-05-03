<template>
  <div class="device-list">
    <h1>设备管理</h1>
    
    <!-- 操作按钮区域 -->
    <div class="panel-actions">
      <button @click="fetchDevices(true)" class="btn btn-refresh">
        <span class="icon">⟳</span>
        <span v-if="!refreshing">刷新设备列表</span>
        <span v-else>同步中...</span>
      </button>
      <button 
        @click="showCreateForm = !showCreateForm" 
        class="btn btn-create"
      >
        <span class="icon">+</span> {{ showCreateForm ? '隐藏创建表单' : '创建新设备' }}
      </button>
    </div>
    
    <DeviceCreate 
      v-if="showCreateForm" 
      @device-created="handleDeviceCreated"
    />
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载设备数据中...
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchDevices">重试</button>
    </div>
    
    <!-- 设备列表 -->
    <div v-if="!loading && !error">
      <!-- 没有设备时显示提示 -->
      <div v-if="devices.length === 0" class="no-devices">
        <p>暂无设备数据</p>
      </div>
      
      <!-- 设备卡片列表 -->
      <div v-else class="device-grid">
        <div v-for="device in paginatedDevices" :key="device.device_id" class="device-card">
          <div class="device-header">
            <h3>{{ device.device_name || '未命名设备' }}</h3>
            <span :class="['status-badge', device.status === 'ONLINE' ? 'status-online' : 'status-offline']">
              {{ device.status === 'ONLINE' ? '在线' : '离线' }}
            </span>
          </div>
          
          <div class="device-info">
            <p><strong>设备ID:</strong> {{ device.device_id }}</p>
            <!-- <p><strong>节点ID:</strong> {{ device.node_id }}</p> -->
            <p v-if="device.product_name"><strong>产品名称:</strong> {{ device.product_name }}</p>
            
            <!-- 
            <p v-if="device.description"><strong>描述:</strong> {{ device.description }}</p>
            <p v-if="device.node_type"><strong>设备类型:</strong> {{ device.node_type }}</p>
            <p><strong>创建时间:</strong> {{ formatDate(device.created_time) }}</p>
            <p v-if="device.app_name"><strong>所属应用:</strong> {{ device.app_name }}</p>
            <p v-if="device.fw_version"><strong>固件版本:</strong> {{ device.fw_version }}</p>
            <p v-if="device.sw_version"><strong>软件版本:</strong> {{ device.sw_version }}</p> -->
          </div>
          
          <div class="device-actions">
            <button @click="openDetailModal(device)" class="btn btn-details">
              <span class="icon">🔍</span> 详情
            </button>
            <button @click="openCommandModal(device)" class="btn btn-command">
              <span class="icon">⚡</span> 命令
            </button>
            <button @click="openEditModal(device)" class="btn btn-edit">
              <span class="icon">✏️</span> 编辑
            </button>
            <button @click="confirmDelete(device)" class="btn btn-delete">
              <span class="icon">🗑️</span> 删除
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分页控制器 -->
      <div v-if="devices.length > pageSize" class="pagination">
        <button 
          class="btn btn-page" 
          :disabled="currentPage === 1" 
          @click="currentPage--"
        >
          <span class="icon">◀</span> 上一页
        </button>
        
        <div class="page-info">
          <span>{{ currentPage }} / {{ totalPages }}</span>
        </div>
        
        <button 
          class="btn btn-page" 
          :disabled="currentPage === totalPages" 
          @click="currentPage++"
        >
          下一页 <span class="icon">▶</span>
        </button>
      </div>
    </div>
    
    <!-- 设备详情模态框 -->
    <teleport to="body">
      <div v-if="detailModalVisible" class="modal">
        <div class="modal-content detail-modal">
          <span class="close-btn" @click="closeDetailModal">&times;</span>
          <h2>设备详情</h2>
          <div v-if="selectedDevice" class="device-detail-container">
            <div class="detail-header">
              <h3>{{ selectedDevice.device_name || '未命名设备' }}</h3>
              <span :class="['status-badge', selectedDevice.status === 'ONLINE' ? 'status-online' : 'status-offline']">
                {{ selectedDevice.status === 'ONLINE' ? '在线' : '离线' }}
              </span>
            </div>
            
            <div class="device-detail-info">
              <div class="detail-loading" v-if="loadingDetail">正在加载设备详情...</div>
              <div class="detail-error" v-if="detailError">{{ detailError }}</div>
              <div v-if="!loadingDetail && !detailError">
                <div class="section-title">基本信息</div>
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <td>设备ID</td>
                      <td>{{ selectedDevice.device_id }}</td>
                    </tr>
                    <tr>
                      <td>节点ID</td>
                      <td>{{ selectedDevice.node_id }}</td>
                    </tr>
                    <tr>
                      <td>设备名称</td>
                      <td>{{ selectedDevice.device_name }}</td>
                    </tr>
                    <tr>
                      <td>设备类型</td>
                      <td>{{ selectedDevice.node_type }}</td>
                    </tr>
                    <tr>
                      <td>所属产品</td>
                      <td>{{ selectedDevice.product_name }}</td>
                    </tr>
                    <tr>
                      <td>所属应用</td>
                      <td>{{ selectedDevice.app_name }}</td>
                    </tr>
                    <tr>
                      <td>设备状态</td>
                      <td :class="selectedDevice.status === 'ONLINE' ? 'text-success' : 'text-danger'">
                        {{ selectedDevice.status === 'ONLINE' ? '在线' : '离线' }}
                      </td>
                    </tr>
                    <tr v-if="selectedDevice.description">
                      <td>设备描述</td>
                      <td>{{ selectedDevice.description }}</td>
                    </tr>
                    <tr>
                      <td>创建时间</td>
                      <td>{{ formatDate(selectedDevice.created_time) }}</td>
                    </tr>
                    <tr v-if="selectedDevice.last_status_change_time">
                      <td>最后状态变更</td>
                      <td>{{ formatDate(selectedDevice.last_status_change_time) }}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="section-title">产品信息</div>
                <table class="detail-table">
                  <tbody>
                    <tr v-if="selectedDevice.product_id">
                      <td>产品ID</td>
                      <td>{{ selectedDevice.product_id }}</td>
                    </tr>
                    <tr v-if="selectedDevice.product_name">
                      <td>产品名称</td>
                      <td>{{ selectedDevice.product_name }}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="section-title">网关信息</div>
                <table class="detail-table">
                  <tbody>
                    <tr v-if="selectedDevice.gateway_id">
                      <td>网关ID</td>
                      <td>{{ selectedDevice.gateway_id }}</td>
                    </tr>
                    <tr v-if="selectedDevice.node_type === 'GATEWAY'">
                      <td>网关类型</td>
                      <td>{{ selectedDevice.node_type }}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="section-title">应用信息</div>
                <table class="detail-table">
                  <tbody>
                    <tr v-if="selectedDevice.app_id">
                      <td>应用ID</td>
                      <td>{{ selectedDevice.app_id }}</td>
                    </tr>
                    <tr v-if="selectedDevice.app_name">
                      <td>应用名称</td>
                      <td>{{ selectedDevice.app_name }}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="section-title">版本信息</div>
                <table class="detail-table">
                  <tbody>
                    <tr v-if="selectedDevice.fw_version">
                      <td>固件版本</td>
                      <td>{{ selectedDevice.fw_version }}</td>
                    </tr>
                    <tr v-if="selectedDevice.sw_version">
                      <td>软件版本</td>
                      <td>{{ selectedDevice.sw_version }}</td>
                    </tr>
                    <tr v-if="selectedDevice.device_sdk_version">
                      <td>设备SDK版本</td>
                      <td>{{ selectedDevice.device_sdk_version }}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-if="selectedDevice.tags && selectedDevice.tags.length > 0" class="section-title">设备标签</div>
                <div v-if="selectedDevice.tags && selectedDevice.tags.length > 0" class="device-tags">
                  <div v-for="(tag, index) in selectedDevice.tags" :key="index" class="device-tag">
                    <strong>{{ tag.tag_name }}:</strong> {{ tag.tag_value }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-actions">
              <button @click="refreshDeviceDetail" class="form-btn btn-refresh-detail" :disabled="loadingDetail">
                <span class="icon">⟳</span> {{ loadingDetail ? '刷新中...' : '刷新数据' }}
              </button>
              <button 
                v-if="selectedDevice.status === 'ONLINE'" 
                @click="freezeDevice" 
                class="form-btn btn-freeze"
                :disabled="loadingDetail"
              >
                <span class="icon">❄️</span> 冻结设备
              </button>
              <button 
                v-else 
                @click="unfreezeDevice" 
                class="form-btn btn-unfreeze"
                :disabled="loadingDetail"
              >
                <span class="icon">☀️</span> 解冻设备
              </button>
              <button @click="closeDetailModal" class="form-btn btn-close-detail">
                <span class="icon">✖</span> 关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
    
<!-- 设备命令模态框 -->
<device-command-modal
      :visible="commandModalVisible"
      :device="selectedDevice"
      @close="closeCommandModal"
    />

    <!-- 编辑设备模态框 -->
    <teleport to="body">
      <div v-if="editModalVisible" class="modal">
        <div class="modal-content edit-device-form">
          <span class="close-btn" @click="closeEditModal">&times;</span>
          <h2 class="edit-form-title">{{ isCreating ? '创建设备' : '编辑设备' }}</h2>
          
          <form @submit.prevent="updateDevice" class="device-edit-form">
            <div class="form-group">
              <label for="deviceName">
                <span class="label-icon">📋</span>
                设备名称
                <span class="required-mark">*</span>
              </label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="deviceName" 
                  v-model="editForm.device_name" 
                  required
                  placeholder="请输入设备名称"
                  class="form-control"
                />
                <span class="input-icon" v-if="editForm.device_name">✓</span>
              </div>
              <small class="form-text">设备名称用于标识设备，建议使用有意义的名称</small>
            </div>
            
            <div class="form-group">
              <label for="deviceDescription">
                <span class="label-icon">📝</span>
                设备描述
              </label>
              <div class="input-wrapper">
                <textarea 
                  id="deviceDescription" 
                  v-model="editForm.description" 
                  placeholder="请输入设备描述信息(选填)"
                  class="form-control form-textarea"
                  rows="4"
                ></textarea>
              </div>
              <small class="form-text">设备描述可帮助您更好地识别设备用途或特性</small>
            </div>
            
            <div class="form-submit">
              <div class="device-preview">
                <div class="preview-label">设备预览</div>
                <div class="device-card-preview">
                  <div class="preview-header">
                    <span class="preview-name">{{ editForm.device_name || '设备名称' }}</span>
                    <span class="preview-status">{{ selectedDevice?.status === 'ONLINE' ? '在线' : '离线' }}</span>
                  </div>
                  <div class="preview-desc">{{ editForm.description || '暂无描述' }}</div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" @click="closeEditModal" class="form-btn btn-cancel">
                  <span class="btn-icon">✖</span>取消
                </button>
                <button 
                  @click="freezeDevice" 
                  class="form-btn btn-freeze"
                  :disabled="updating"
                >
                  <span class="btn-icon">❄️</span>冻结设备
                </button>
                <button 
                  @click="unfreezeDevice" 
                  class="form-btn btn-unfreeze"
                  :disabled="updating"
                >
                  <span class="btn-icon">☀️</span>解冻设备
                </button>
                <button type="submit" class="form-btn btn-submit" :disabled="updating">
                  <span class="btn-icon">{{ updating ? '⏳' : '💾' }}</span>
                  {{ updating ? '更新中...' : '保存更改' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </teleport>
    
    <!-- 删除设备确认模态框 -->
    <teleport to="body">
      <div v-if="deleteModalVisible" class="modal">
        <div class="modal-content">
          <span class="close-btn" @click="closeDeleteModal">&times;</span>
          <h2>确认删除</h2>
          <p>您确定要删除设备 "{{ selectedDevice?.device_name }}" 吗？此操作不可撤销。</p>
          
          <div class="form-actions">
            <button @click="closeDeleteModal" class="form-btn btn-cancel">取消</button>
            <button @click="deleteDevice" class="form-btn btn-delete-confirm" :disabled="deleting">
              {{ deleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import axios from 'axios'
import DeviceCreate from './DeviceCreate.vue'
import DeviceCommandModal from './DeviceCommandModal.vue'

export default {
  name: 'DeviceList',
  components: {
    DeviceCreate,
    DeviceCommandModal
  },
  data() {
    return {
      devices: [], // 设备列表数据
      loading: false, // 加载状态
      refreshing: false, // 刷新状态
      error: null, // 错误信息
      showCreateForm: false, // 是否显示创建表单
      editModalVisible: false, // 是否显示编辑模态框
      deleteModalVisible: false, // 是否显示删除模态框
      commandModalVisible: false, // 是否显示命令模态框
      selectedDevice: null, // 选中的设备
      editForm: {
        device_name: '',
        description: ''
      },
      updating: false,
      deleting: false,
      currentPage: 1, // 当前页码
      pageSize: 6, // 每页显示数量
      detailModalVisible: false, // 是否显示设备详情模态框
      loadingDetail: false,
      detailError: null,
    }
  },
  computed: {
    // 计算总页数
    totalPages() {
      return Math.ceil(this.devices.length / this.pageSize);
    },
    // 当前页的设备数据
    paginatedDevices() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.devices.slice(startIndex, endIndex);
    }
  },
  // 组件挂载时获取设备列表
  mounted() {
    this.fetchDevices()
  },
  methods: {
    // 从后端获取设备列表
    async fetchDevices(refresh = false) {
      if (refresh) {
        this.refreshing = true
      } else {
        this.loading = true
      }
      this.error = null
      
      try {
        // 发起HTTP请求获取设备列表
        const url = `/api/devices${refresh ? '?refresh=true' : ''}`
        const response = await axios.get(url)
        
        // 处理响应
        if (response.data.success) {
          this.devices = response.data.devices
          console.log('获取到设备数据:', this.devices.length, '条')
          if (this.devices.length > 0) {
            console.log('设备示例:', this.devices[0])
          }
        } else {
          throw new Error(response.data.message || '获取设备列表失败')
        }
      } catch (error) {
        console.error('获取设备列表错误:', error)
        this.error = error.response?.data?.message || error.message || '无法获取设备列表，请检查网络连接或服务器状态'
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    // 处理设备创建成功事件
    handleDeviceCreated(newDevice) {
      console.log('设备创建成功:', newDevice)
      // 刷新设备列表
      this.fetchDevices()
      // 创建成功后隐藏创建表单
      this.showCreateForm = false
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未知'
      
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    // 打开编辑模态框
    openEditModal(device) {
      this.selectedDevice = device
      this.editModalVisible = true
      this.editForm.device_name = device.device_name
      this.editForm.description = device.description || ''
    },
    
    // 确认删除设备
    confirmDelete(device) {
      this.selectedDevice = device
      this.deleteModalVisible = true
    },
    
    // 关闭编辑模态框
    closeEditModal() {
      this.editModalVisible = false
    },
    
    // 更新设备
    async updateDevice() {
      this.updating = true
      this.error = null
      
      try {
        // 发起HTTP请求更新设备
        const url = `/api/devices/${this.selectedDevice.device_id}`
        console.log('发送更新请求体:', {
          device_name: this.editForm.device_name,
          description: this.editForm.description
        })
        const response = await axios.put(url, {
          device_name: this.editForm.device_name,
          description: this.editForm.description
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        // 处理响应
        if (response.data.success) {
          // 更新本地设备列表中的设备信息
          const index = this.devices.findIndex(d => d.device_id === this.selectedDevice.device_id)
          if (index !== -1) {
            this.devices[index] = response.data.device
          }
          this.closeEditModal()
          // 显示成功消息
          alert('设备更新成功')
        } else {
          throw new Error(response.data.message || '更新设备失败')
        }
      } catch (error) {
        console.error('更新设备错误:', error)
        this.error = error.response?.data?.message || error.message || '无法更新设备，请检查网络连接或服务器状态'
        alert(this.error)
      } finally {
        this.updating = false
      }
    },
    
    // 删除设备
    async deleteDevice() {
      this.deleting = true
      this.error = null
      
      try {
        // 发起HTTP请求删除设备
        const url = `/api/devices/${this.selectedDevice.device_id}`
        const response = await axios.delete(url)
        
        // 处理响应
        if (response.data.success) {
          // 从本地设备列表中移除该设备
          this.devices = this.devices.filter(d => d.device_id !== this.selectedDevice.device_id)
          this.closeDeleteModal()
          // 显示成功消息
          alert('设备已成功删除')
        } else {
          throw new Error(response.data.message || '删除设备失败')
        }
      } catch (error) {
        console.error('删除设备错误:', error)
        this.error = error.response?.data?.message || error.message || '无法删除设备，请检查网络连接或服务器状态'
        alert(this.error)
      } finally {
        this.deleting = false
      }
    },
    
    // 关闭删除模态框
    closeDeleteModal() {
      this.deleteModalVisible = false
    },
    
    // 获取设备类型的中文名称
    getDeviceTypeName(deviceType) {
      const typeMap = {
        'GATEWAY': '网关设备',
        'DIRECTLY_CONNECTED_DEVICE': '直连设备',
        'CHILD_DEVICE': '子设备',
        'UNKNOWN': '未知类型'
      };
      return typeMap[deviceType] || deviceType;
    },
    
    // 打开设备详情模态框
    openDetailModal(device) {
      this.selectedDevice = device
      this.detailModalVisible = true
      this.fetchDeviceDetail(device.device_id)
    },
    
    // 获取设备详细信息
    async fetchDeviceDetail(deviceId) {
      this.loadingDetail = true
      this.detailError = null
      
      try {
        const response = await axios.get(`/api/devices/${deviceId}`)
        
        if (response.data.success) {
          // 更新选中的设备信息
          this.selectedDevice = {
            ...this.selectedDevice,  // 保留原有信息
            ...response.data.device  // 用新获取的信息更新
          }
          console.log('获取设备详情成功:', this.selectedDevice)
        } else {
          console.error('获取设备详情失败:', response.data.message)
        }
      } catch (error) {
        console.error('获取设备详情错误:', error)
        this.detailError = error.response?.data?.message || error.message || '无法获取设备详情，请检查网络连接或服务器状态'
      } finally {
        this.loadingDetail = false
      }
    },
    
    // 关闭设备详情模态框
    closeDetailModal() {
      this.detailModalVisible = false
    },
    
    // 打开命令模态框
    openCommandModal(device) {
      this.selectedDevice = device;
      this.commandModalVisible = true;
    },

    // 关闭命令模态框
    closeCommandModal() {
      this.commandModalVisible = false;
    },

    // 刷新设备详情
    async refreshDeviceDetail() {
      await this.fetchDeviceDetail(this.selectedDevice.device_id)
    },
    
    // 冻结设备
    async freezeDevice() {
      if (!this.selectedDevice?.device_id) {
        alert('无法获取设备ID');
        return;
      }

      try {
        const response = await axios.post('/api/device-freeze', null, {
          headers: {
            'device-id': this.selectedDevice.device_id
          }
        });
        
        if (response.data.success) {
          alert('设备冻结成功');
          // 刷新设备列表
          await this.fetchDevices(true);
          // 关闭编辑模态框
          this.closeEditModal();
        } else {
          throw new Error(response.data.message || '冻结设备失败');
        }
      } catch (error) {
        console.error('冻结设备失败:', error);
        alert(error.response?.data?.message || error.message || '冻结设备失败，请稍后重试');
      }
    },
    
    // 解冻设备
    async unfreezeDevice() {
      if (!this.selectedDevice?.device_id) {
        alert('无法获取设备ID');
        return;
      }

      try {
        const response = await axios.delete('/api/device-freeze', {
          headers: {
            'device-id': this.selectedDevice.device_id
          }
        });
        
        if (response.data.success) {
          alert('设备解冻成功');
          // 刷新设备列表
          await this.fetchDevices(true);
          // 关闭编辑模态框
          this.closeEditModal();
        } else {
          throw new Error(response.data.message || '解冻设备失败');
        }
      } catch (error) {
        console.error('解冻设备失败:', error);
        alert(error.response?.data?.message || error.message || '解冻设备失败，请稍后重试');
      }
    },
  }
}
</script>

<style scoped>
.device-list {
  width: 100%;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  position: relative;
  padding-left: 1rem;
}

h1::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  width: 4px;
  background: linear-gradient(180deg, #1890ff, #52c41a);
  border-radius: 2px;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.btn-refresh {
  background: linear-gradient(90deg, #52c41a, #389e0d);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

.btn-refresh::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(45deg);
  z-index: 1;
  transition: all 0.6s ease;
  opacity: 0;
}

.btn-refresh:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(82, 196, 26, 0.3);
}

.btn-refresh:hover::before {
  opacity: 1;
  transform: rotate(45deg) translate(50%, 50%);
}

.btn-create {
  background: linear-gradient(90deg, #1890ff, #096dd9);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.btn-create::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(45deg);
  z-index: 1;
  transition: all 0.6s ease;
  opacity: 0;
}

.btn-create:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
}

.btn-create:hover::before {
  opacity: 1;
  transform: rotate(45deg) translate(50%, 50%);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #1890ff;
  position: relative;
  background-color: rgba(245, 245, 250, 0.5);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.05);
}

.loading::after {
  content: '';
  display: block;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  margin: 15px auto 0;
  animation: loadingPulse 1.5s infinite ease-in-out;
}

.error-message {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 10%);
  border: 1px solid rgba(245, 34, 45, 0.2);
  padding: 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(245, 34, 45, 0.08);
}

.error-message p {
  color: #cf1322;
  margin-bottom: 1rem;
}

.error-message button {
  background: linear-gradient(90deg, #ff4d4f, #cf1322);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.error-message button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(45deg);
  z-index: 1;
  transition: all 0.4s ease;
  opacity: 0;
}

.error-message button:hover::before {
  opacity: 1;
  transform: rotate(45deg) translate(50%, 50%);
}

.no-devices {
  text-align: center;
  padding: 3.5rem;
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
  border-radius: 12px;
  color: #8c8c8c;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
  border: 1px dashed #d9d9d9;
  position: relative;
}

.no-devices::before {
  content: '📱';
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-devices p {
  font-size: 1.1rem;
  font-weight: 500;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.device-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 24, 80, 0.06);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(24, 144, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.device-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  transform: scaleX(0);
  transform-origin: 0 0;
  transition: transform 0.5s ease;
}

.device-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.3);
}

.device-card:hover::before {
  transform: scaleX(1);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
}

.device-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
}

.device-header h3::before {
  content: '📱';
  margin-right: 0.5rem;
  font-size: 1.2rem;
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

.device-info {
  margin-bottom: 1.2rem;
  padding: 0.5rem;
  background-color: rgba(245, 245, 250, 0.5);
  border-radius: 8px;
}

.device-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-info strong {
  color: #1890ff;
  font-weight: 600;
}

.device-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.device-actions .btn {
  text-align: center;
  font-weight: 500;
  padding: 0.8rem 0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
  transition: all 0.3s ease;
}

.device-actions .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

.btn-details {
  background-color: #e6f7ff;
  color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
}

.btn-command {
  background: #1890ff;
  color: white;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
}

.btn-edit {
  background: #faad14;
  color: white;
  box-shadow: 0 2px 6px rgba(250, 173, 20, 0.2);
}

.btn-delete {
  background: #f5222d;
  color: white;
  box-shadow: 0 2px 6px rgba(245, 34, 45, 0.2);
}

.icon {
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn .icon {
  margin-right: 0.25rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.btn-page {
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
  color: #1890ff;
  border: 1px solid rgba(24, 144, 255, 0.2);
  font-weight: 500;
  min-width: 80px;
  position: relative;
  overflow: hidden;
}

.btn-page::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
  z-index: -2;
}

.btn-page::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  transition: all 0.3s;
  z-index: -1;
}

.btn-page:hover:not(:disabled)::before {
  width: 100%;
}

.btn-page:disabled {
  color: #bfbfbf;
  background: #f5f5f5;
  border-color: #d9d9d9;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #595959;
  background: rgba(24, 144, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  min-width: 80px;
  text-align: center;
  font-weight: 500;
}

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
  padding: 1.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(24, 144, 255, 0.15);
  position: relative;
  animation: slideUp 0.4s ease forwards;
  border: 1px solid rgba(24, 144, 255, 0.1);
  overflow: hidden;
  max-height: 85vh;
  overflow-y: auto;
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

.detail-modal {
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

.section-title {
  color: #1890ff;
  font-weight: 600;
  position: relative;
  margin: 1.5rem 0 1rem;
  padding-left: 12px;
  font-size: 1.1rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
  border-radius: 2px;
}

.detail-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 1.5rem;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-table tr {
  transition: background-color 0.2s ease;
}

.detail-table tr:nth-child(odd) {
  background-color: rgba(24, 144, 255, 0.03);
}

.detail-table tr:hover {
  background-color: rgba(24, 144, 255, 0.06);
}

.detail-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
}

.detail-table tr:last-child td {
  border-bottom: none;
}

.detail-table td:first-child {
  width: 35%;
  color: #595959;
  font-weight: 500;
}

.detail-table td:last-child {
  color: #262626;
}

.text-success {
  color: #13a452 !important;
  font-weight: 500;
}

.text-danger {
  color: #cf1322 !important;
  font-weight: 500;
}

.device-detail-container {
  background-color: rgba(245, 245, 250, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(24, 144, 255, 0.05);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
}

.detail-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.detail-header h3::before {
  content: '📱';
  margin-right: 0.75rem;
  font-size: 1.3rem;
}

.detail-loading, .detail-error {
  text-align: center;
  padding: 2rem;
  background-color: rgba(245, 245, 250, 0.5);
  border-radius: 8px;
}

.detail-loading {
  color: #1890ff;
  position: relative;
}

.detail-loading::after {
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

.detail-error {
  color: #f5222d;
  border: 1px solid rgba(245, 34, 45, 0.2);
}

.detail-actions {
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

.btn-refresh-detail {
  background: linear-gradient(90deg, #52c41a, #389e0d);
  color: white;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

.btn-refresh-detail:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(82, 196, 26, 0.3);
}

.btn-refresh-detail:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-close-detail {
  background: linear-gradient(90deg, #ff4d4f, #cf1322);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 34, 45, 0.2);
}

.btn-close-detail:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(245, 34, 45, 0.3);
}

.btn-delete-confirm {
  background: linear-gradient(90deg, #ff4d4f, #cf1322);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 34, 45, 0.2);
}

.btn-delete-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 34, 45, 0.3);
}

.btn-delete-confirm:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 设备编辑表单样式 */
.edit-device-form {
  max-width: 650px;
}

.edit-form-title {
  color: var(--primary-color, #1890ff);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
}

.edit-form-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color, #1890ff), #52c41a);
  margin: 10px auto 0;
  border-radius: 3px;
}

.device-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-weight: 600;
  color: #595959;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  font-size: 1.1rem;
}

.required-mark {
  color: #f5222d;
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #52c41a;
  font-size: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: #f9f9f9;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color, #1890ff);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  background-color: #fff;
}

.form-textarea {
  resize: none;
  min-height: 80px;
}

.form-text {
  font-size: 0.85rem;
  color: #8c8c8c;
}

.form-submit {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-preview {
  background-color: rgba(24, 144, 255, 0.05);
  border-radius: 10px;
  padding: 0.8rem;
  border: 1px dashed rgba(24, 144, 255, 0.3);
}

.preview-label {
  font-size: 0.9rem;
  color: #8c8c8c;
  margin-bottom: 0.8rem;
  text-align: center;
}

.device-card-preview {
  background: white;
  border-radius: 8px;
  padding: 0.8rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #f0f0f0;
}

.preview-name {
  font-weight: 600;
  color: var(--primary-color, #1890ff);
}

.preview-status {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  background-color: #fff1f0;
  color: #cf1322;
}

.preview-desc {
  font-size: 0.9rem;
  color: #595959;
  line-height: 1.5;
  max-height: 60px;
  overflow-y: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.8rem;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #595959;
}

.btn-cancel:hover {
  background-color: #f0f0f0;
}

.btn-submit {
  background: linear-gradient(90deg, var(--primary-color, #1890ff), #40a9ff);
  color: white;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-submit:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-freeze {
  background: linear-gradient(90deg, #1890ff, #096dd9);
  color: white;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.btn-freeze:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
}

.btn-unfreeze {
  background: linear-gradient(90deg, #52c41a, #389e0d);
  color: white;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.2);
}

.btn-unfreeze:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(82, 196, 26, 0.3);
}
</style> 