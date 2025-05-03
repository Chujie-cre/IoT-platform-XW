// 设备控制器模块
const DeviceModel = require('../models/device');
const huaweiCloud = require('../utils/huaweiCloud');

/**
 * 设备控制器类，处理设备相关的请求
 */
class DeviceController {
  /**
   * 获取所有设备列表
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async getAllDevices(req, res) {
    try {
      console.log('直接从华为云IoT平台获取设备列表');
      
      try {
        // 直接从华为云IoT平台获取设备列表
        const cloudDevices = await DeviceController.fetchDevicesFromCloud();
        
        return res.status(200).json({
          success: true,
          message: '从华为云IoT平台获取设备列表成功',
          count: cloudDevices.length,
          devices: cloudDevices
        });
      } catch (cloudError) {
        console.error('从华为云IoT平台获取设备失败:', cloudError);
        
        return res.status(500).json({
          success: false,
          message: '从华为云IoT平台获取设备列表失败',
          error: cloudError.message
        });
      }
    } catch (error) {
      console.error('获取设备列表失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '获取设备列表失败',
        error: error.message
      });
    }
  }

  /**
   * 获取单个设备详情
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async getDeviceById(req, res) {
    try {
      const { deviceId } = req.params;
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: '设备ID不能为空'
        });
      }
      
      try {
        // 直接从华为云IoT平台获取设备详情
        const device = await DeviceController.fetchDeviceFromCloud(deviceId);
        
        return res.status(200).json({
          success: true,
          message: '获取设备详情成功',
          device
        });
      } catch (cloudError) {
        console.error(`从华为云IoT平台获取设备[${deviceId}]详情失败:`, cloudError);
        
        return res.status(404).json({
          success: false,
          message: `未找到ID为${deviceId}的设备`,
          error: cloudError.message
        });
      }
    } catch (error) {
      console.error('获取设备详情失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '获取设备详情失败',
        error: error.message
      });
    }
  }

  /**
   * 创建新设备
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async createDevice(req, res) {
    try {
      const { 
        device_name, 
        product_id, 
        node_id, 
        description, 
        project_id, 
        instance_id, 
        app_id 
      } = req.body;
      
      // 验证必要字段
      if (!device_name || !product_id || !project_id || !instance_id || !app_id) {
        return res.status(400).json({
          success: false,
          message: '设备名称、产品ID、项目ID、实例ID和应用ID不能为空'
        });
      }
      
      // 生成有效的节点ID
      const validNodeId = huaweiCloud.generateValidNodeId(device_name, node_id);
      
      // 如果提供的node_id无效，告知用户
      if (node_id && !huaweiCloud.isValidNodeId(node_id)) {
        return res.status(400).json({
          success: false,
          message: '设备ID格式无效，只能包含字母、数字、冒号、下划线和连字符，长度1-64',
          suggestedNodeId: validNodeId
        });
      }
      
      // 向华为云IoT平台创建设备
      const cloudDevice = await DeviceController.createDeviceInCloud({
        device_name,
        product_id,
        node_id: validNodeId,
        description,
        project_id,
        instance_id,
        app_id
      });
      
      if (!cloudDevice || !cloudDevice.device_id) {
        return res.status(500).json({
          success: false,
          message: '在云平台创建设备失败'
        });
      }
      
      // 直接返回云平台创建的设备信息
      return res.status(201).json({
        success: true,
        message: '设备创建成功',
        device: cloudDevice
      });
    } catch (error) {
      console.error('创建设备失败:', error);
      
      // 处理特定的错误情况
      if (error.response && error.response.data) {
        const errorCode = error.response.data.error_code;
        if (errorCode === 'IOTDA.014115') {
          // 设备ID已存在
          return res.status(409).json({
            success: false,
            message: '设备ID已存在，请使用其他设备ID',
            error: error.message
          });
        } else if (errorCode === 'IOTDA.014204') {
          // 产品ID不存在
          return res.status(404).json({
            success: false,
            message: '指定的产品ID不存在',
            error: error.message
          });
        }
      }
      
      return res.status(500).json({
        success: false,
        message: '创建设备失败',
        error: error.message
      });
    }
  }

  /**
   * 更新设备信息
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async updateDevice(req, res) {
    try {
      const { deviceId } = req.params;
      const { device_name, description, product_id, status } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: '设备ID不能为空'
        });
      }
      
      try {
        // 直接在华为云IoT平台更新设备
        const updatedDevice = await DeviceController.updateDeviceInCloud(deviceId, {
          device_name,
          description,
          product_id,
          status
        });
        
        return res.status(200).json({
          success: true,
          message: '设备信息更新成功',
          device: updatedDevice
        });
      } catch (cloudError) {
        console.error(`在华为云IoT平台更新设备[${deviceId}]失败:`, cloudError);
        
        return res.status(404).json({
          success: false,
          message: `更新设备失败，未找到ID为${deviceId}的设备或更新请求无效`,
          error: cloudError.message
        });
      }
    } catch (error) {
      console.error('更新设备信息失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '更新设备信息失败',
        error: error.message
      });
    }
  }

  /**
   * 删除设备
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async deleteDevice(req, res) {
    try {
      const { deviceId } = req.params;
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: '设备ID不能为空'
        });
      }
      
      try {
        // 直接从华为云IoT平台删除设备
        await DeviceController.deleteDeviceFromCloud(deviceId);
        
        return res.status(200).json({
          success: true,
          message: '设备删除成功'
        });
      } catch (cloudError) {
        console.error(`从华为云IoT平台删除设备[${deviceId}]失败:`, cloudError);
        
        return res.status(404).json({
          success: false,
          message: `删除设备失败，未找到ID为${deviceId}的设备`,
          error: cloudError.message
        });
      }
    } catch (error) {
      console.error('删除设备失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '删除设备失败',
        error: error.message
      });
    }
  }

  /**
   * 从华为云IoT平台获取设备列表
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<Array>} 设备列表
   * @private
   */
  static async fetchDevicesFromCloud(maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取IoT客户端
        const client = huaweiCloud.getIoTClient();
        
        // 创建请求对象（使用普通对象而非构造函数）
        const request = {};
        
        // 执行请求
        console.log(`尝试获取设备列表，第${retries + 1}次尝试`);
        const response = await client.listDevices(request);
        
        const devices = response.devices || [];
        console.log(`从华为云IoT平台获取到${devices.length}个设备`);
        console.log('设备原始数据示例:', devices.length > 0 ? JSON.stringify(devices[0], null, 2) : '无设备');
        
        // 转换为本地数据库格式，包含更多设备信息
        const formattedDevices = devices.map(device => {
          return {
            device_id: device.device_id,
            node_id: device.node_id,
            device_name: device.device_name,
            product_id: device.product_id,
            product_name: device.product_name,
            status: device.status || 'INACTIVE',
            description: device.description || '',
            node_type: device.node_type || '',
            gateway_id: device.gateway_id,
            app_id: device.app_id,
            app_name: device.app_name,
            fw_version: device.fw_version,
            sw_version: device.sw_version,
            device_sdk_version: device.device_sdk_version,
            tags: device.tags || [],
            created_time: device.create_time || new Date().toISOString()
          };
        });
        
        return formattedDevices;
      } catch (error) {
        console.error('从华为云IoT平台获取设备列表失败:', error);
        
        // 如果是连接重置或网络错误，且未达到最大重试次数，则重试
        if ((error.errorMsg === 'read ECONNRESET' || 
             error.message === 'read ECONNRESET' ||
             error.message?.includes('network') || 
             error.errorMsg?.includes('network') ||
             error.httpStatusCode === undefined) && 
            retries < maxRetries) {
          
          retries++;
          console.log(`网络错误，将在${retryDelay}ms后进行第${retries + 1}次重试`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // 其他错误或达到最大重试次数，抛出异常
        throw error;
      }
    }
  }

  /**
   * 在华为云IoT平台创建设备
   * @param {Object} deviceInfo 设备信息
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<Object>} 创建的设备信息
   * @private
   */
  static async createDeviceInCloud(deviceInfo, maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取IoT客户端
        const client = huaweiCloud.getIoTClient(deviceInfo.project_id);
        
        // 创建请求对象
        const request = {};
        
        // 创建设备信息对象
        const body = {
          node_id: deviceInfo.node_id,
          device_name: deviceInfo.device_name,
          product_id: deviceInfo.product_id,
          app_id: deviceInfo.app_id
        };
        
        // 设置实例ID（如果存在）
        if (deviceInfo.instance_id) {
          request.instance_id = deviceInfo.instance_id;
        }
        
        // 设置可选参数
        if (deviceInfo.description) {
          body.description = deviceInfo.description;
        }
        
        // 设置请求体
        request.body = body;
        
        // 执行请求
        console.log(`尝试创建设备，第${retries + 1}次尝试`);
        console.log('向华为云IoT平台发送创建设备请求:', JSON.stringify(request, null, 2));
        const result = await client.addDevice(request);
        
        console.log('设备在华为云IoT平台创建成功:', result.device_id);
        
        // 返回创建的设备信息
        return {
          device_id: result.device_id,
          node_id: deviceInfo.node_id,
          device_name: deviceInfo.device_name,
          product_id: deviceInfo.product_id,
          description: deviceInfo.description || "",
          status: 'INACTIVE', // 默认状态
          secret: result.secret || ""  // 返回平台生成的密钥
        };
      } catch (error) {
        console.error('在华为云IoT平台创建设备失败:', error);
        
        // 如果是连接重置或网络错误，且未达到最大重试次数，则重试
        if ((error.errorMsg === 'read ECONNRESET' || 
             error.message === 'read ECONNRESET' ||
             error.message?.includes('network') || 
             error.errorMsg?.includes('network') ||
             error.httpStatusCode === undefined) && 
            retries < maxRetries) {
          
          retries++;
          console.log(`网络错误，将在${retryDelay}ms后进行第${retries + 1}次重试`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // 其他错误或达到最大重试次数，抛出异常
        throw error;
      }
    }
  }

  /**
   * 从华为云IoT平台获取设备详情
   * @param {string} deviceId 设备ID
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<Object>} 设备详情
   * @private
   */
  static async fetchDeviceFromCloud(deviceId, maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取IoT客户端
        const client = huaweiCloud.getIoTClient();
        
        // 创建请求对象（使用普通对象而非构造函数）
        const request = {
          device_id: deviceId
        };
        
        // 执行请求
        console.log(`尝试获取设备[${deviceId}]详情，第${retries + 1}次尝试`);
        const response = await client.showDevice(request);
        
        const device = response;
        console.log('从华为云IoT平台获取设备详情成功');
        console.log('设备详情原始数据:', JSON.stringify(device, null, 2));
        
        // 转换为标准格式，包含更多设备信息
        const formattedDevice = {
          device_id: device.device_id,
          node_id: device.node_id,
          device_name: device.device_name,
          product_id: device.product_id,
          product_name: device.product_name,
          status: device.status || 'INACTIVE',
          description: device.description || '',
          node_type: device.node_type || '',
          gateway_id: device.gateway_id,
          app_id: device.app_id,
          app_name: device.app_name,
          fw_version: device.fw_version,
          sw_version: device.sw_version,
          device_sdk_version: device.device_sdk_version,
          tags: device.tags || [],
          created_time: device.create_time || new Date().toISOString(),
          last_status_change_time: device.last_status_change_time
        };
        
        return formattedDevice;
      } catch (error) {
        console.error(`从华为云IoT平台获取设备[${deviceId}]详情失败:`, error);
        
        // 如果是连接重置或网络错误，且未达到最大重试次数，则重试
        if ((error.errorMsg === 'read ECONNRESET' || 
             error.message === 'read ECONNRESET' ||
             error.message?.includes('network') || 
             error.errorMsg?.includes('network') ||
             error.httpStatusCode === undefined) && 
            retries < maxRetries) {
          
          retries++;
          console.log(`网络错误，将在${retryDelay}ms后进行第${retries + 1}次重试`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // 其他错误或达到最大重试次数，抛出异常
        throw error;
      }
    }
  }

  /**
   * 在华为云IoT平台更新设备信息
   * @param {string} deviceId 设备ID
   * @param {Object} deviceInfo 设备信息
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<Object>} 更新后的设备信息
   * @private
   */
  static async updateDeviceInCloud(deviceId, deviceInfo, maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取IoT客户端
        const client = huaweiCloud.getIoTClient();
        
        // 创建请求对象（使用普通对象而非构造函数）
        const request = {
          device_id: deviceId
        };
        
        // 直接使用前端传入的数据
        request.body = deviceInfo;
        
        // 执行请求
        console.log(`尝试更新设备，第${retries + 1}次尝试`);
        console.log(`向华为云IoT平台发送更新设备[${deviceId}]请求:`, JSON.stringify(request.body, null, 2));
        const response = await client.updateDevice(request);
        
        console.log(`设备[${deviceId}]在华为云IoT平台更新成功`);
        
        // 获取更新后的设备信息
        return await DeviceController.fetchDeviceFromCloud(deviceId);
      } catch (error) {
        console.error(`在华为云IoT平台更新设备[${deviceId}]失败:`, error);
        
        // 如果是连接重置或网络错误，且未达到最大重试次数，则重试
        if ((error.errorMsg === 'read ECONNRESET' || 
             error.message === 'read ECONNRESET' ||
             error.message?.includes('network') || 
             error.errorMsg?.includes('network') ||
             error.httpStatusCode === undefined) && 
            retries < maxRetries) {
          
          retries++;
          console.log(`网络错误，将在${retryDelay}ms后进行第${retries + 1}次重试`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // 其他错误或达到最大重试次数，抛出异常
        throw error;
      }
    }
  }

  /**
   * 从华为云IoT平台删除设备
   * @param {string} deviceId 设备ID
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<boolean>} 是否删除成功
   * @private
   */
  static async deleteDeviceFromCloud(deviceId, maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取IoT客户端
        const client = huaweiCloud.getIoTClient();
        
        // 创建请求对象（使用普通对象而非构造函数）
        const request = {
          device_id: deviceId
        };
        
        // 执行请求
        console.log(`尝试删除设备[${deviceId}]，第${retries + 1}次尝试`);
        const response = await client.deleteDevice(request);
        
        console.log(`设备[${deviceId}]在华为云IoT平台删除成功`);
        return true;
      } catch (error) {
        console.error(`从华为云IoT平台删除设备[${deviceId}]失败:`, error);
        
        // 如果是404错误（设备不存在），不抛出异常，视为成功
        if (error.httpStatusCode === 404) {
          console.log(`设备[${deviceId}]在云平台不存在，视为删除成功`);
          return true;
        }
        
        // 如果是连接重置或网络错误，且未达到最大重试次数，则重试
        if ((error.errorMsg === 'read ECONNRESET' || 
             error.message === 'read ECONNRESET' ||
             error.message?.includes('network') || 
             error.errorMsg?.includes('network') ||
             error.httpStatusCode === undefined) && 
            retries < maxRetries) {
          
          retries++;
          console.log(`网络错误，将在${retryDelay}ms后进行第${retries + 1}次重试`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // 其他错误或达到最大重试次数，抛出异常
        throw error;
      }
    }
  }
}

module.exports = DeviceController; 