<template>
  <div class="service-management" v-if="product">
    <div class="detail-header">
      <div class="title-section">
        <h2>{{ product.name }} - 服务管理</h2>
        <span class="product-type">{{ getDeviceTypeName(product.device_type) }}</span>
      </div>
      <div class="action-buttons">
        <button v-if="isEditing" @click="saveChanges" class="btn btn-save" :disabled="saving">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
        <button v-if="isEditing" @click="cancelEditing" class="btn btn-cancel">取消</button>
        <button v-if="!isEditing" @click="startEditing" class="btn btn-edit">编辑服务</button>
        <button @click="close" class="btn btn-close">返回</button>
      </div>
    </div>
    
    <div v-if="product.service_capabilities && product.service_capabilities.length > 0">
      <!-- 遍历服务能力列表 -->
      <div v-for="(service, index) in editedProduct.service_capabilities" :key="index" class="service-card">
        <div class="service-header">
          <h3>
            <span v-if="!isEditing">{{ service.service_type }}</span>
            <input v-else type="text" v-model="service.service_type" class="form-control" />
          </h3>
          <span class="service-option">{{ getServiceOption(service.option) }}</span>
        </div>
        
        <div class="service-info">
          <div class="info-item">
            <span class="label">服务ID</span>
            <span v-if="!isEditing" class="value">{{ service.service_id }}</span>
            <input 
              v-else 
              type="text" 
              v-model="service.service_id" 
              class="form-control"
              @change="serviceIdChanged(service, $event)" 
            />
          </div>
          <div class="info-item">
            <span class="label">描述</span>
            <span v-if="!isEditing" class="value">{{ service.description || '-' }}</span>
            <input v-else type="text" v-model="service.description" class="form-control" />
          </div>
        </div>
        
        <!-- 属性列表 -->
        <div class="property-section" v-if="service.properties && service.properties.length > 0">
          <div class="section-header">
            <h4>属性列表</h4>
            <button v-if="isEditing" @click="addProperty(service)" class="btn btn-sm btn-add">
              添加属性
            </button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>属性名称</th>
                  <th>数据类型</th>
                  <th>访问方式</th>
                  <th>是否必选</th>
                  <th>取值范围</th>
                  <th v-if="isEditing">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(prop, pIndex) in service.properties" :key="pIndex">
                  <td>
                    <span v-if="!isEditing">{{ prop.property_name }}</span>
                    <input v-else type="text" v-model="prop.property_name" class="form-control" />
                  </td>
                  <td>
                    <span v-if="!isEditing">{{ prop.data_type }}</span>
                    <select v-else v-model="prop.data_type" class="form-control">
                      <option value="int">int</option>
                      <option value="decimal">decimal</option>
                      <option value="string">string</option>
                      <option value="boolean">boolean</option>
                      <option value="enum">enum</option>
                      <option value="datetime">datetime</option>
                    </select>
                  </td>
                  <td>
                    <span v-if="!isEditing">{{ getAccessMethod(prop.method) }}</span>
                    <select v-else v-model="prop.method" class="form-control">
                      <option value="R">只读</option>
                      <option value="W">只写</option>
                      <option value="RW">读写</option>
                    </select>
                  </td>
                  <td>
                    <span v-if="!isEditing">{{ prop.required ? '是' : '否' }}</span>
                    <input v-else type="checkbox" v-model="prop.required" />
                  </td>
                  <td>
                    <span v-if="!isEditing">
                      <span v-if="prop.enum_list">{{ prop.enum_list.join(', ') }}</span>
                      <span v-else-if="prop.min !== undefined && prop.max !== undefined">{{ prop.min }} ~ {{ prop.max }}</span>
                      <span v-else>-</span>
                    </span>
                    <div v-else>
                      <div v-if="prop.data_type === 'enum'">
                        <input type="text" v-model="prop.enum_list_text" placeholder="用逗号分隔枚举值" class="form-control" @change="updateEnumList(prop)" />
                      </div>
                      <div v-else class="range-inputs">
                        <input type="text" v-model="prop.min" placeholder="最小值" class="form-control" />
                        <span>~</span>
                        <input type="text" v-model="prop.max" placeholder="最大值" class="form-control" />
                      </div>
                    </div>
                  </td>
                  <td v-if="isEditing">
                    <button @click="removeProperty(service, pIndex)" class="btn btn-sm btn-danger">
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else-if="isEditing" class="no-properties">
          <h4>属性列表</h4>
          <p>该服务暂无属性</p>
          <button @click="addProperty(service)" class="btn btn-add">
            添加属性
          </button>
        </div>
        
        <!-- 命令列表 -->
        <div class="command-section" v-if="service.commands && service.commands.length > 0">
          <div class="section-header">
            <h4>命令列表</h4>
            <button v-if="isEditing" @click="addCommand(service)" class="btn btn-sm btn-add">
              添加命令
            </button>
          </div>
          <div v-for="(cmd, cIndex) in service.commands" :key="cIndex" class="command-item">
            <div class="command-header">
              <div>
                <span v-if="!isEditing"><strong>{{ cmd.command_name }}</strong></span>
                <input v-else type="text" v-model="cmd.command_name" class="form-control" />
              </div>
              <div v-if="isEditing">
                <button @click="removeCommand(service, cIndex)" class="btn btn-sm btn-danger">
                  删除命令
                </button>
              </div>
            </div>
            
            <!-- 命令参数 -->
            <div v-if="cmd.paras && cmd.paras.length > 0" class="command-params">
              <div class="section-header">
                <h5>参数列表</h5>
                <button v-if="isEditing" @click="addCommandParam(cmd)" class="btn btn-sm btn-add">
                  添加参数
                </button>
              </div>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>参数名称</th>
                      <th>数据类型</th>
                      <th>是否必选</th>
                      <th>取值范围</th>
                      <th v-if="isEditing">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(para, paraIndex) in cmd.paras" :key="paraIndex">
                      <td>
                        <span v-if="!isEditing">{{ para.para_name }}</span>
                        <input v-else type="text" v-model="para.para_name" class="form-control" />
                      </td>
                      <td>
                        <span v-if="!isEditing">{{ para.data_type }}</span>
                        <select v-else v-model="para.data_type" class="form-control">
                          <option value="int">int</option>
                          <option value="decimal">decimal</option>
                          <option value="string">string</option>
                          <option value="boolean">boolean</option>
                          <option value="enum">enum</option>
                          <option value="datetime">datetime</option>
                        </select>
                      </td>
                      <td>
                        <span v-if="!isEditing">{{ para.required ? '是' : '否' }}</span>
                        <input v-else type="checkbox" v-model="para.required" />
                      </td>
                      <td>
                        <span v-if="!isEditing">
                          <span v-if="para.enum_list">{{ para.enum_list.join(', ') }}</span>
                          <span v-else-if="para.min !== undefined && para.max !== undefined">{{ para.min }} ~ {{ para.max }}</span>
                          <span v-else>-</span>
                        </span>
                        <div v-else>
                          <div v-if="para.data_type === 'enum'">
                            <input type="text" v-model="para.enum_list_text" placeholder="用逗号分隔枚举值" class="form-control" @change="updateParaEnumList(para)" />
                          </div>
                          <div v-else class="range-inputs">
                            <input type="text" v-model="para.min" placeholder="最小值" class="form-control" />
                            <span>~</span>
                            <input type="text" v-model="para.max" placeholder="最大值" class="form-control" />
                          </div>
                        </div>
                      </td>
                      <td v-if="isEditing">
                        <button @click="removeCommandParam(cmd, paraIndex)" class="btn btn-sm btn-danger">
                          删除
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="isEditing" class="no-params">
              <button @click="addCommandParam(cmd)" class="btn btn-sm btn-add">
                添加参数
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="isEditing" class="no-commands">
          <button @click="addCommand(service)" class="btn btn-add">
            添加命令
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="no-service">
      <p>该产品暂无服务管理信息</p>
      <button v-if="isEditing" @click="addService" class="btn btn-add">
        添加服务
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ServiceManagementDetail',
  props: {
    productId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      product: null,
      editedProduct: null, // 用于编辑的产品副本
      loading: false,
      error: null,
      isEditing: false, // 编辑模式状态
      saving: false // 保存状态
    }
  },
  watch: {
    productId: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.fetchProductDetails(newValue);
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
        const response = await axios.get(`/api/product-details/${productId}`);
        
        if (response.data.success) {
          this.product = response.data.data;
          // 创建一个深拷贝，用于编辑
          this.editedProduct = JSON.parse(JSON.stringify(this.product));
          
          // 为enum类型的属性添加文本字段
          if (this.editedProduct.service_capabilities) {
            this.editedProduct.service_capabilities.forEach(service => {
              if (service.properties) {
                service.properties.forEach(prop => {
                  if (prop.enum_list) {
                    prop.enum_list_text = prop.enum_list.join(',');
                  }
                });
              }
              
              if (service.commands) {
                service.commands.forEach(cmd => {
                  if (cmd.paras) {
                    cmd.paras.forEach(para => {
                      if (para.enum_list) {
                        para.enum_list_text = para.enum_list.join(',');
                      }
                    });
                  }
                });
              }
            });
          }
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
    
    // 开始编辑模式
    startEditing() {
      this.isEditing = true;
      // 确保编辑的是一个深拷贝
      this.editedProduct = JSON.parse(JSON.stringify(this.product));
      
      // 为enum类型的属性添加文本字段
      if (this.editedProduct.service_capabilities) {
        this.editedProduct.service_capabilities.forEach(service => {
          if (service.properties) {
            service.properties.forEach(prop => {
              if (prop.enum_list) {
                prop.enum_list_text = prop.enum_list.join(',');
              }
            });
          }
          
          if (service.commands) {
            service.commands.forEach(cmd => {
              if (cmd.paras) {
                cmd.paras.forEach(para => {
                  if (para.enum_list) {
                    para.enum_list_text = para.enum_list.join(',');
                  }
                });
              }
            });
          }
        });
      }
    },
    
    // 取消编辑
    cancelEditing() {
      this.isEditing = false;
      // 还原为原始数据
      this.editedProduct = JSON.parse(JSON.stringify(this.product));
    },
    
    // 保存修改
    async saveChanges() {
      this.saving = true;
      
      try {
        // 验证服务ID的唯一性
        const serviceIds = new Set();
        let hasDuplicateServiceId = false;
        
        if (this.editedProduct.service_capabilities) {
          // 验证服务ID
          for (const service of this.editedProduct.service_capabilities) {
            if (serviceIds.has(service.service_id)) {
              hasDuplicateServiceId = true;
              break;
            }
            serviceIds.add(service.service_id);
            
            // 确保服务ID不为空
            if (!service.service_id) {
              throw new Error('服务ID不能为空');
            }
          }
          
          if (hasDuplicateServiceId) {
            throw new Error('服务ID必须唯一，请修改重复的服务ID');
          }
          
          // 处理枚举列表文本转换为数组，并确保属性和命令与服务正确关联
          this.editedProduct.service_capabilities.forEach(service => {
            if (service.properties) {
              service.properties.forEach(prop => {
                if (prop.data_type === 'enum' && prop.enum_list_text) {
                  prop.enum_list = prop.enum_list_text.split(',').map(item => item.trim());
                  delete prop.enum_list_text; // 删除临时字段
                }
                
                // 确保属性名称不为空
                if (!prop.property_name) {
                  throw new Error(`服务 "${service.service_id}" 中的属性名称不能为空`);
                }
              });
            }
            
            if (service.commands) {
              service.commands.forEach(cmd => {
                // 确保命令名称不为空
                if (!cmd.command_name) {
                  throw new Error(`服务 "${service.service_id}" 中的命令名称不能为空`);
                }
                
                if (cmd.paras) {
                  cmd.paras.forEach(para => {
                    if (para.data_type === 'enum' && para.enum_list_text) {
                      para.enum_list = para.enum_list_text.split(',').map(item => item.trim());
                      delete para.enum_list_text; // 删除临时字段
                    }
                    
                    // 确保参数名称不为空
                    if (!para.para_name) {
                      throw new Error(`命令 "${cmd.command_name}" 中的参数名称不能为空`);
                    }
                  });
                }
              });
            }
          });
        }
        
        // 准备更新数据
        const updateData = {
          // 保留产品基本信息
          name: this.editedProduct.name,
          device_type: this.editedProduct.device_type,
          protocol_type: this.editedProduct.protocol_type,
          data_format: this.editedProduct.data_format,
          manufacturer_name: this.editedProduct.manufacturer_name,
          industry: this.editedProduct.industry,
          description: this.editedProduct.description,
          // 更新服务能力
          service_capabilities: this.editedProduct.service_capabilities
        };
        
        // 调试信息 - 显示完整请求体
        console.log('发送产品更新请求(完整):', {
          url: `/api/product-update?productId=${this.productId}`,
          method: 'PUT',
          data: JSON.stringify(updateData, null, 2)
        });
        
        // 直接使用fetch API尝试发送请求，以便更好地调试
        const requestData = JSON.stringify(updateData);
        this.logApiRequest('PUT', `/api/product-update?productId=${this.productId}`, requestData);
        
        const fetchResponse = await fetch(`/api/product-update?productId=${this.productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestData
        });
        
        // 解析响应
        const responseData = await fetchResponse.json();
        this.logApiResponse(fetchResponse.status, responseData);
        
        if (responseData.success) {
          // 更新成功，更新本地数据
          this.product = JSON.parse(JSON.stringify(this.editedProduct));
          this.isEditing = false;
          
          // 如果更新成功但华为云端无变化，尝试再次获取产品详情验证状态
          if (responseData.data && responseData.data.service_capabilities) {
            const serviceCapabilitiesResponse = responseData.data.service_capabilities;
            console.log('华为云返回的service_capabilities:', JSON.stringify(serviceCapabilitiesResponse, null, 2));
            
            // 检查返回的capabilities和我们提交的是否一致
            if (serviceCapabilitiesResponse.some(s => s.properties === null || s.commands === null)) {
              console.warn('警告: 华为云返回的service_capabilities中properties或commands为null，可能未正确更新');
              // 显示警告信息 
              this.showWarningMessage('服务更新成功，但华为云平台可能未完全应用服务属性和命令的变更。请检查产品详情。');
            } else {
              // 显示成功消息
              this.showSuccessMessage('产品服务成功更新到本地和华为云平台');
            }
          } else {
            // 显示成功消息，但没有确认华为云状态
            this.showSuccessMessage('产品服务更新成功');
          }
          
          console.log('产品更新成功，返回数据:', responseData);
        } else {
          throw new Error(responseData.message || '更新产品服务失败');
        }
      } catch (error) {
        console.error('更新产品服务错误:', error);
        
        // 提取API返回的详细错误信息
        let errorMsg = '';
        if (error.response && error.response.data) {
          errorMsg = error.response.data.error || error.response.data.message || '更新产品服务失败';
          // 显示完整错误信息
          console.error('API错误响应详情:', {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data
          });
        } else {
          errorMsg = error.message || '更新产品服务失败，请检查网络连接或服务器状态';
        }
        
        // 调试信息 - 尝试本地检验数据格式问题
        console.log('调试 - 完整的service_capabilities数据:', JSON.stringify(this.editedProduct.service_capabilities, null, 2));
        
        this.error = errorMsg;
        
        // 显示错误消息
        this.showErrorMessage(errorMsg);
      } finally {
        this.saving = false;
      }
    },
    
    // 添加新服务
    addService() {
      if (!this.editedProduct.service_capabilities) {
        this.editedProduct.service_capabilities = [];
      }
      
      // 生成唯一服务ID
      const serviceId = 'service_' + Date.now();
      
      // 添加新服务
      this.editedProduct.service_capabilities.push({
        service_id: serviceId,
        service_type: serviceId, // 服务类型默认与ID一致，用户可以修改
        description: '',
        option: 'Optional',
        properties: [],
        commands: []
      });
    },
    
    // 添加新属性
    addProperty(service) {
      if (!service.properties) {
        service.properties = [];
      }
      
      // 生成与服务ID关联的属性名称
      const propertyId = `${service.service_id}_property_${Date.now()}`;
      
      // 添加新属性
      service.properties.push({
        property_name: propertyId,
        data_type: 'int',
        required: true,
        method: 'RW',
        min: '0',
        max: '100'
      });
    },
    
    // 删除属性
    removeProperty(service, index) {
      service.properties.splice(index, 1);
    },
    
    // 添加新命令
    addCommand(service) {
      if (!service.commands) {
        service.commands = [];
      }
      
      // 生成与服务ID关联的命令名称
      const commandId = `${service.service_id}_command_${Date.now()}`;
      
      // 添加新命令
      service.commands.push({
        command_name: commandId,
        paras: []
      });
    },
    
    // 删除命令
    removeCommand(service, index) {
      service.commands.splice(index, 1);
    },
    
    // 添加命令参数
    addCommandParam(command) {
      if (!command.paras) {
        command.paras = [];
      }
      
      // 生成与命令名关联的参数名称
      const paramId = `${command.command_name}_param_${Date.now()}`;
      
      // 添加新参数
      command.paras.push({
        para_name: paramId,
        data_type: 'int',
        required: false,
        min: '0',
        max: '100'
      });
    },
    
    // 删除命令参数
    removeCommandParam(command, index) {
      command.paras.splice(index, 1);
    },
    
    // 更新枚举列表
    updateEnumList(prop) {
      if (prop.enum_list_text) {
        prop.enum_list = prop.enum_list_text.split(',').map(item => item.trim());
      } else {
        prop.enum_list = null;
      }
    },
    
    // 更新参数枚举列表
    updateParaEnumList(para) {
      if (para.enum_list_text) {
        para.enum_list = para.enum_list_text.split(',').map(item => item.trim());
      } else {
        para.enum_list = null;
      }
    },
    
    // 显示成功消息
    showSuccessMessage(message) {
      const successElement = document.createElement('div');
      successElement.className = 'floating-success-message';
      successElement.textContent = message;
      document.body.appendChild(successElement);
      
      // 2秒后移除成功提示
      setTimeout(() => {
        document.body.removeChild(successElement);
      }, 2000);
    },
    
    // 显示错误消息
    showErrorMessage(message) {
      const errorElement = document.createElement('div');
      errorElement.className = 'floating-error-message';
      errorElement.textContent = message;
      document.body.appendChild(errorElement);
      
      // 5秒后移除错误提示
      setTimeout(() => {
        document.body.removeChild(errorElement);
      }, 5000);
    },
    
    // 显示警告消息
    showWarningMessage(message) {
      const warningElement = document.createElement('div');
      warningElement.className = 'floating-warning-message';
      warningElement.textContent = message;
      document.body.appendChild(warningElement);
      
      // 4秒后移除警告提示
      setTimeout(() => {
        document.body.removeChild(warningElement);
      }, 4000);
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
        'smokeDetector': '烟雾探测器',
        'Others': '其他'
      }
      return typeMap[deviceType] || deviceType;
    },
    
    // 获取服务选项类型
    getServiceOption(option) {
      const optionMap = {
        'Mandatory': '必选',
        'Optional': '可选',
        'Condition': '条件可选'
      }
      return optionMap[option] || option || '未设置';
    },
    
    // 获取属性访问方式
    getAccessMethod(method) {
      const methodMap = {
        'R': '只读',
        'W': '只写',
        'RW': '读写'
      }
      return methodMap[method] || method || '未设置';
    },
    
    // 显示信息消息
    showInfoMessage(message) {
      const infoElement = document.createElement('div');
      infoElement.className = 'floating-info-message';
      infoElement.textContent = message;
      document.body.appendChild(infoElement);
      
      // 3秒后移除信息提示
      setTimeout(() => {
        document.body.removeChild(infoElement);
      }, 3000);
    },
    
    // 记录API请求
    logApiRequest(method, url, data) {
      console.log('%c API请求 ', 'background: #8e44ad; color: white; padding: 2px 4px; border-radius: 2px;', {
        时间: new Date().toLocaleTimeString(),
        方法: method,
        URL: url,
        数据: JSON.parse(data)
      });
      
      // 如果环境支持localStorage，将请求存储到本地以便调试
      try {
        if (window.localStorage) {
          const requestLog = {
            timestamp: Date.now(),
            method, 
            url,
            data: JSON.parse(data)
          };
          const requests = JSON.parse(localStorage.getItem('api_requests') || '[]');
          requests.push(requestLog);
          localStorage.setItem('api_requests', JSON.stringify(requests.slice(-10))); // 只保留最近10条
        }
      } catch (e) {
        console.error('无法将API请求保存到localStorage', e);
      }
    },
    
    // 记录API响应
    logApiResponse(status, data) {
      console.log('%c API响应 ', 'background: #27ae60; color: white; padding: 2px 4px; border-radius: 2px;', {
        时间: new Date().toLocaleTimeString(),
        状态: status,
        数据: data
      });
      
      // 如果环境支持localStorage，将响应存储到本地以便调试
      try {
        if (window.localStorage) {
          const responseLog = {
            timestamp: Date.now(),
            status,
            data
          };
          const responses = JSON.parse(localStorage.getItem('api_responses') || '[]');
          responses.push(responseLog);
          localStorage.setItem('api_responses', JSON.stringify(responses.slice(-10))); // 只保留最近10条
        }
      } catch (e) {
        console.error('无法将API响应保存到localStorage', e);
      }
    },
    
    // 关闭当前页面，返回上级
    close() {
      this.$emit('close');
    },
    
    // 服务ID变化事件
    serviceIdChanged(service, event) {
      const newServiceId = event.target.value;
      const oldServiceId = event.target._oldValue || '';
      
      // 存储当前值作为旧值，供下次比较
      event.target._oldValue = newServiceId;
      
      // 只有在有旧ID且新ID不为空的情况下才更新关联
      if (oldServiceId && newServiceId && oldServiceId !== newServiceId) {
        // 记录是否进行了更新
        let hasUpdated = false;
        
        // 更新属性名称前缀
        if (service.properties && service.properties.length > 0) {
          service.properties.forEach(prop => {
            // 检查属性名称是否以旧服务ID开头
            if (prop.property_name && prop.property_name.startsWith(`${oldServiceId}_`)) {
              // 替换前缀
              prop.property_name = prop.property_name.replace(
                `${oldServiceId}_`, 
                `${newServiceId}_`
              );
              hasUpdated = true;
            }
          });
        }
        
        // 更新命令名称前缀
        if (service.commands && service.commands.length > 0) {
          service.commands.forEach(cmd => {
            // 检查命令名称是否以旧服务ID开头
            if (cmd.command_name && cmd.command_name.startsWith(`${oldServiceId}_`)) {
              // 旧命令名，用于更新参数前缀
              const oldCommandName = cmd.command_name;
              
              // 替换前缀
              cmd.command_name = cmd.command_name.replace(
                `${oldServiceId}_`, 
                `${newServiceId}_`
              );
              
              // 更新命令参数前缀
              if (cmd.paras && cmd.paras.length > 0) {
                cmd.paras.forEach(para => {
                  if (para.para_name && para.para_name.startsWith(`${oldCommandName}_`)) {
                    // 替换命令前缀
                    para.para_name = para.para_name.replace(
                      `${oldCommandName}_`, 
                      `${cmd.command_name}_`
                    );
                  }
                });
              }
              
              hasUpdated = true;
            }
          });
        }
        
        // 显示更新提示
        if (hasUpdated) {
          this.showInfoMessage('已自动更新关联的属性和命令名称');
        }
      }
    }
  }
}
</script>

<style scoped>
.service-management {
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-close {
  background-color: #f5f5f5;
  color: #666;
}

.btn-close:hover {
  background-color: #e6e6e6;
}

.btn-edit {
  background-color: #faad14;
  color: white;
}

.btn-edit:hover {
  background-color: #e8a612;
}

.btn-save {
  background-color: #52c41a;
  color: white;
}

.btn-save:hover {
  background-color: #49ad17;
}

.btn-save:disabled {
  background-color: #b7eb8f;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background-color: #e6e6e6;
}

.btn-add {
  background-color: #1890ff;
  color: white;
}

.btn-add:hover {
  background-color: #096dd9;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-danger {
  background-color: #ff4d4f;
  color: white;
}

.btn-danger:hover {
  background-color: #cf1322;
}

.service-card {
  background-color: #fafafa;
  border-radius: 6px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.service-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.service-option {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  background-color: #e6f7ff;
  color: #1890ff;
}

.service-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  margin-bottom: 0.5rem;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.info-item .value {
  color: #333;
}

.property-section, .command-section {
  margin-top: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

h5 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th {
  background-color: #f5f5f5;
  padding: 0.6rem;
  text-align: left;
  font-weight: 600;
  color: #555;
}

.data-table td {
  padding: 0.6rem;
  border-top: 1px solid #eee;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  width: 100%;
  font-size: 0.9rem;
}

select.form-control {
  height: 2.5rem;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-inputs input {
  width: 45%;
}

.command-item {
  background-color: white;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.command-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.command-params {
  margin-top: 0.5rem;
}

.no-service, .no-commands, .no-params, .no-properties {
  background-color: #fafafa;
  padding: 2rem;
  text-align: center;
  border-radius: 4px;
  color: #999;
  margin-bottom: 1rem;
}

/* 浮动消息样式 */
.floating-success-message,
.floating-error-message,
.floating-info-message,
.floating-warning-message {
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

.floating-info-message {
  background: linear-gradient(90deg, #1890ff, #096dd9);
  animation: floatIn 0.3s ease-out, floatOut 0.3s ease-in 2.7s forwards;
}

.floating-warning-message {
  background: linear-gradient(90deg, #faad14, #e8a612);
  animation: floatIn 0.3s ease-out, floatOut 0.3s ease-in 3.7s forwards;
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
</style> 