<template>
  <div class="product-list">
    <h1>产品管理</h1>
    
    <!-- 操作按钮区域 -->
    <div class="panel-actions">
      <button @click="fetchProducts(true)" class="btn btn-refresh">
        <span class="icon">⟳</span>
        <span v-if="!refreshing">刷新产品列表</span>
        <span v-else>同步中...</span>
      </button>
      <button 
        @click="showCreateForm = !showCreateForm" 
        class="btn btn-create"
      >
        <span class="icon">+</span> {{ showCreateForm ? '隐藏创建表单' : '创建新产品' }}
      </button>
    </div>
    
    <ProductCreate 
      v-if="showCreateForm" 
      @product-created="handleProductCreated"
    />
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载产品数据中...
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchProducts">重试</button>
    </div>
    
    <!-- 产品列表 -->
    <div v-if="!loading && !error">
      <!-- 没有产品时显示提示 -->
      <div v-if="products.length === 0" class="no-products">
        <p>暂无产品数据</p>
        <p>您可以创建一个新的产品</p>
      </div>
      
      <!-- 产品卡片列表 -->
      <div v-else class="product-grid">
        <div 
          v-for="product in paginatedProducts" 
          :key="product.product_id" 
          class="product-card"
          @click="viewProductDetails(product)"
        >
          <div class="product-header">
            <h3>{{ product.name }}</h3>
            <span class="product-type">{{ getDeviceTypeName(product.device_type) }}</span>
          </div>
          
          <div class="product-info">
            <p><strong>产品ID:</strong> {{ product.product_id }}</p>
            <p><strong>协议类型:</strong> {{ product.protocol_type }}</p>
            <p><strong>数据格式:</strong> {{ product.data_format }}</p>
            <!-- <p><strong>厂商:</strong> {{ product.manufacturer_name }}</p>
            <p v-if="product.description"><strong>描述:</strong> {{ product.description }}</p> -->
          </div>
          
          <div class="product-actions" @click.stop>
            <button class="btn btn-details" @click="viewProductDetails(product)">
              <span class="icon">🔍</span> 详情
            </button>
            <button @click="openEditModal(product)" class="btn btn-edit">
              <span class="icon">✏️</span> 编辑
            </button>
            <button @click="viewServiceManagement(product)" class="btn btn-command">
              <span class="icon">⚙️</span> 服务管理
            </button>
            <button @click="deleteProductConfirm(product)" class="btn btn-delete">
              <span class="icon">🗑️</span> 删除
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分页控制器 -->
      <div v-if="products.length > pageSize" class="pagination">
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
    
    <!-- 产品详情 -->
    <teleport to="body">
      <div v-if="showDetailView" class="detail-container">
        <ProductDetail 
          :productId="selectedProduct.product_id" 
          @close="closeDetailView"
          @edit="openEditModal"
          @delete="deleteProductConfirm"
        />
      </div>
    </teleport>
    
    <!-- 服务管理详情 -->
    <teleport to="body">
      <div v-if="showServiceView" class="detail-container">
        <ServiceManagementDetail 
          :productId="selectedProduct.product_id" 
          @close="closeServiceView"
        />
      </div>
    </teleport>
    
    <!-- 删除确认对话框 -->
    <teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="confirm-dialog">
          <h3>确认删除</h3>
          <p>您确定要删除产品 "{{ productToDelete?.name }}" 吗？</p>
          <p class="warning">此操作不可逆，删除后相关的设备可能无法正常工作。</p>
          <div class="dialog-actions">
            <button @click="confirmDelete" class="btn btn-danger" :disabled="deleting">
              {{ deleting ? '删除中...' : '确认删除' }}
            </button>
            <button @click="cancelDelete" class="btn btn-cancel" :disabled="deleting">取消</button>
          </div>
        </div>
      </div>
    </teleport>
    
    <!-- 编辑产品模态框 -->
    <teleport to="body">
      <div v-if="editModalVisible" class="modal-overlay">
        <div class="edit-dialog">
          <h3>编辑产品</h3>
          <form @submit.prevent="updateProduct" class="edit-form">
            <div class="form-group">
              <label for="edit-name">产品名称</label>
              <input 
                type="text" 
                id="edit-name" 
                v-model="editForm.name" 
                required
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-device-type">设备类型</label>
              <select 
                id="edit-device-type" 
                v-model="editForm.device_type" 
                class="form-control"
              >
                <option value="WaterMeter">水表</option>
                <option value="Gateway">网关</option>
                <option value="Sensor">传感器</option>
                <option value="Camera">摄像头</option>
                <option value="Lock">智能锁</option>
                <option value="Light">智能灯</option>
                <option value="smokeDetector">烟雾探测器</option>
                <option value="Others">其他</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="edit-protocol-type">协议类型</label>
              <select 
                id="edit-protocol-type" 
                v-model="editForm.protocol_type" 
                class="form-control"
              >
                <option value="MQTT">MQTT</option>
                <option value="CoAP">CoAP</option>
                <option value="HTTP">HTTP</option>
                <option value="LwM2M">LwM2M</option>
                <option value="Modbus">Modbus</option>
                <option value="ONVIF">ONVIF</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="edit-data-format">数据格式</label>
              <select 
                id="edit-data-format" 
                v-model="editForm.data_format" 
                class="form-control"
              >
                <option value="json">JSON</option>
                <option value="binary">Binary</option>
                <option value="hex">Hexadecimal</option>
                <option value="string">String</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="edit-manufacturer">厂商名称</label>
              <input 
                type="text" 
                id="edit-manufacturer" 
                v-model="editForm.manufacturer_name" 
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-industry">所属行业</label>
              <input 
                type="text" 
                id="edit-industry" 
                v-model="editForm.industry" 
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-description">产品描述</label>
              <textarea 
                id="edit-description" 
                v-model="editForm.description"
                class="form-control"
                rows="3"
              ></textarea>
            </div>
            
            <div class="dialog-actions">
              <button type="submit" class="btn btn-primary" :disabled="updating">
                {{ updating ? '更新中...' : '保存修改' }}
              </button>
              <button type="button" @click="closeEditModal" class="btn btn-cancel" :disabled="updating">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import axios from 'axios'
import ProductCreate from './ProductCreate.vue'
import ProductDetail from './ProductDetail.vue'
import ServiceManagementDetail from './ServiceManagementDetail.vue'

export default {
  name: 'ProductList',
  components: {
    ProductCreate,
    ProductDetail,
    ServiceManagementDetail
  },
  data() {
    return {
      products: [], // 产品列表数据
      loading: false, // 加载状态
      refreshing: false, // 刷新状态
      error: null, // 错误信息
      showCreateForm: false, // 是否显示创建表单
      showDeleteConfirm: false, // 是否显示删除确认框
      productToDelete: null, // 要删除的产品
      deleting: false, // 删除中状态
      editModalVisible: false, // 是否显示编辑模态框
      productToEdit: null, // 要编辑的产品
      editForm: {
        name: '',
        device_type: '',
        protocol_type: '',
        data_format: '',
        manufacturer_name: '',
        industry: '',
        description: ''
      },
      updating: false, // 更新中状态
      showDetailView: false, // 是否显示详情视图
      showServiceView: false, // 是否显示服务管理视图
      selectedProduct: null, // 选中的产品
      currentPage: 1, // 当前页码
      pageSize: 6 // 每页显示数量
    }
  },
  computed: {
    // 计算总页数
    totalPages() {
      return Math.ceil(this.products.length / this.pageSize);
    },
    // 当前页的产品数据
    paginatedProducts() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.products.slice(startIndex, endIndex);
    }
  },
  // 组件挂载时获取产品列表
  mounted() {
    this.fetchProducts()
  },
  methods: {
    // 从后端获取产品列表
    async fetchProducts(refresh = false) {
      if (refresh) {
        this.refreshing = true
      } else {
        this.loading = true
      }
      this.error = null
      
      try {
        // 发起HTTP请求获取产品列表
        const url = `/api/products${refresh ? '?refresh=true' : ''}`
        const response = await axios.get(url)
        
        // 处理响应
        if (response.data.success) {
          this.products = response.data.data
        } else {
          throw new Error(response.data.message || '获取产品列表失败')
        }
      } catch (error) {
        console.error('获取产品列表错误:', error)
        this.error = error.response?.data?.message || error.message || '无法获取产品列表，请检查网络连接或服务器状态'
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    // 处理产品创建成功事件
    handleProductCreated(newProduct) {
      console.log('产品创建成功:', newProduct)
      
      // 隐藏创建表单
      this.showCreateForm = false;
      
      // 显示成功提示悬浮窗
      const successElement = document.createElement('div');
      successElement.className = 'floating-success-message';
      successElement.textContent = `产品 "${newProduct.name}" 创建成功`;
      document.body.appendChild(successElement);
      
      // 2秒后移除成功提示
      setTimeout(() => {
        document.body.removeChild(successElement);
      }, 2000);
      
      // 刷新产品列表
      this.fetchProducts()
    },
    
    // 获取设备类型的中文名称
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
      return typeMap[deviceType] || deviceType
    },
    
    // 删除产品确认
    deleteProductConfirm(product) {
      // 检查产品是否关联了设备
      // 后期可添加实际检查逻辑，目前只是提示风险
      this.productToDelete = product;
      this.showDeleteConfirm = true;
    },
    
    // 取消删除
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.productToDelete = null;
    },
    
    // 确认删除产品
    async confirmDelete() {
      if (!this.productToDelete) return;
      
      this.deleting = true;
      
      try {
        const response = await axios.delete(`/api/products/${this.productToDelete.product_id}`);
        
        if (response.data.success) {
          // 删除成功，更新列表
          this.products = this.products.filter(p => p.product_id !== this.productToDelete.product_id);
          this.showDeleteConfirm = false;
          this.productToDelete = null;
          
          // 显示成功提示，可使用一个临时消息
          const successElement = document.createElement('div');
          successElement.className = 'floating-success-message';
          successElement.textContent = '产品删除成功';
          document.body.appendChild(successElement);
          
          // 2秒后移除成功提示
          setTimeout(() => {
            document.body.removeChild(successElement);
          }, 2000);
        } else {
          throw new Error(response.data.message || '删除产品失败');
        }
      } catch (error) {
        console.error('删除产品错误:', error);
        this.error = error.response?.data?.message || error.message || '删除产品失败，请稍后重试';
      } finally {
        this.deleting = false;
      }
    },
    
    // 打开编辑模态框
    openEditModal(product) {
      this.productToEdit = product;
      this.editForm.name = product.name;
      this.editForm.device_type = product.device_type;
      this.editForm.protocol_type = product.protocol_type;
      this.editForm.data_format = product.data_format;
      this.editForm.manufacturer_name = product.manufacturer_name || '';
      this.editForm.industry = product.industry || '';
      this.editForm.description = product.description || '';
      this.editModalVisible = true;
    },
    
    // 关闭编辑模态框
    closeEditModal() {
      this.editModalVisible = false;
      this.productToEdit = null;
    },
    
    // 更新产品
    async updateProduct() {
      if (!this.productToEdit) return;
      
      this.updating = true;
      this.error = null;
      
      try {
        // 发起HTTP请求更新产品
        const response = await axios.put(`/api/product-update?productId=${this.productToEdit.product_id}`, {
          name: this.editForm.name,
          device_type: this.editForm.device_type,
          protocol_type: this.editForm.protocol_type,
          data_format: this.editForm.data_format,
          manufacturer_name: this.editForm.manufacturer_name,
          industry: this.editForm.industry,
          description: this.editForm.description
        });
        
        if (response.data.success) {
          // 更新本地列表中的产品信息
          const index = this.products.findIndex(p => p.product_id === this.productToEdit.product_id);
          if (index !== -1) {
            this.products[index] = { ...this.products[index], ...response.data.data };
          }
          this.closeEditModal();
          
          // 显示成功消息
          const successElement = document.createElement('div');
          successElement.className = 'floating-success-message';
          successElement.textContent = '产品更新成功';
          document.body.appendChild(successElement);
          
          // 2秒后移除成功提示
          setTimeout(() => {
            document.body.removeChild(successElement);
          }, 2000);
        } else {
          throw new Error(response.data.message || '更新产品失败');
        }
      } catch (error) {
        console.error('更新产品错误:', error);
        
        // 提取API返回的详细错误信息
        let errorMsg = '';
        if (error.response && error.response.data) {
          errorMsg = error.response.data.error || error.response.data.message || '更新产品失败';
        } else {
          errorMsg = error.message || '更新产品失败，请检查网络连接或服务器状态';
        }
        
        this.error = errorMsg;
        
        // 显示错误弹窗
        const errorElement = document.createElement('div');
        errorElement.className = 'floating-error-message';
        errorElement.textContent = errorMsg;
        document.body.appendChild(errorElement);
        
        // 5秒后移除错误提示
        setTimeout(() => {
          document.body.removeChild(errorElement);
        }, 5000);
      } finally {
        this.updating = false;
      }
    },
    
    // 查看产品详情
    viewProductDetails(product) {
      this.selectedProduct = product;
      this.showDetailView = true;
    },
    
    // 查看服务管理
    viewServiceManagement(product) {
      this.selectedProduct = product;
      this.showServiceView = true;
    },
    
    // 关闭产品详情
    closeDetailView() {
      this.showDetailView = false;
      this.selectedProduct = null;
    },
    
    // 关闭服务管理
    closeServiceView() {
      this.showServiceView = false;
      this.selectedProduct = null;
    }
  }
}
</script>

<style scoped>
.product-list {
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
  background: linear-gradient(180deg, #1890ff, #722ed1);
  border-radius: 2px;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  gap: 1rem;
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
  background: linear-gradient(90deg, #1890ff, #722ed1);
  margin: 15px auto 0;
  animation: loadingPulse 1.5s infinite ease-in-out;
}

@keyframes loadingPulse {
  0% { width: 50px; opacity: 0.3; }
  50% { width: 150px; opacity: 1; }
  100% { width: 50px; opacity: 0.3; }
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

.no-products {
  text-align: center;
  padding: 3.5rem;
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
  border-radius: 12px;
  color: #8c8c8c;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
  border: 1px dashed #d9d9d9;
  position: relative;
}

.no-products::before {
  content: '��';
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-products p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 24, 80, 0.06);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(24, 144, 255, 0.1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #722ed1);
  transform: scaleX(0);
  transform-origin: 0 0;
  transition: transform 0.5s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.3);
}

.product-card:hover::before {
  transform: scaleX(1);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
}

.product-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
}

.product-header h3::before {
  content: '📦';
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.product-type {
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #1890ff;
}

.product-info {
  margin-bottom: 1.2rem;
  padding: 0.5rem;
  background-color: rgba(245, 245, 250, 0.5);
  border-radius: 8px;
}

.product-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-info strong {
  color: #1890ff;
  font-weight: 600;
}

.product-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.product-actions .btn {
  text-align: center;
  font-weight: 500;
  padding: 0.8rem 0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  border: none;
  transition: all 0.3s ease;
}

.product-actions .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

.btn-details {
  background-color: #e6f7ff;
  color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
}

.btn-command {
  background: #722ed1;
  color: white;
  box-shadow: 0 2px 6px rgba(114, 46, 209, 0.2);
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
  padding: 0.6rem 1rem;
  border-radius: 8px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 浮动消息样式 */
.floating-success-message,
.floating-error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  animation: floatIn 0.3s ease-out, floatOut 0.3s ease-in 1.7s forwards;
}

.floating-success-message {
  background: linear-gradient(90deg, #52c41a, #389e0d);
}

.floating-error-message {
  background: linear-gradient(90deg, #f5222d, #cf1322);
  animation: floatIn 0.3s ease-out, floatOut 0.3s ease-in 4.7s forwards;
}

@keyframes floatIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes floatOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.confirm-dialog, .edit-dialog {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  padding: 2.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(24, 144, 255, 0.15);
  position: relative;
  animation: slideUp 0.4s ease forwards;
  border: 1px solid rgba(24, 144, 255, 0.1);
}

.edit-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

.edit-form {
  padding-right: 0.5rem;
}

.edit-form::-webkit-scrollbar {
  width: 6px;
}

.edit-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.edit-form::-webkit-scrollbar-thumb {
  background: #1890ff;
  border-radius: 3px;
}

.edit-form::-webkit-scrollbar-thumb:hover {
  background: #096dd9;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-danger {
  background: linear-gradient(90deg, #ff4d4f, #cf1322);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(245, 34, 45, 0.3);
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid #d9d9d9;
}

.btn-cancel:hover:not(:disabled) {
  background: #e6e6e6;
  transform: translateY(-3px);
}

.edit-form .form-group {
  margin-bottom: 1.2rem;
}

.edit-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1890ff;
}

.edit-form .form-control {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: rgba(245, 245, 250, 0.5);
}

.edit-form .form-control:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.edit-form textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.detail-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;
}

.detail-container > div {
  width: 50%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style> 