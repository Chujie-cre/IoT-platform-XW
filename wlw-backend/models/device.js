// 设备模型模块
const { query } = require('../utils/database');

/**
 * 设备模型类，提供设备相关数据操作
 */
class DeviceModel {
  /**
   * 获取所有设备列表
   * @returns {Promise<Array>} 设备列表
   */
  static async getAllDevices() {
    try {
      return await query('SELECT * FROM devices ORDER BY id DESC');
    } catch (error) {
      console.error('获取所有设备失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取设备
   * @param {string} deviceId 设备ID
   * @returns {Promise<Object>} 设备信息
   */
  static async getDeviceById(deviceId) {
    try {
      const devices = await query('SELECT * FROM devices WHERE device_id = ?', [deviceId]);
      return devices.length > 0 ? devices[0] : null;
    } catch (error) {
      console.error(`获取设备(ID: ${deviceId})失败:`, error);
      throw error;
    }
  }

  /**
   * 创建新设备
   * @param {Object} deviceData 设备数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createDevice(deviceData) {
    try {
      const { device_id, node_id, device_name, product_id, status } = deviceData;
      
      const result = await query(
        'INSERT INTO devices (device_id, node_id, device_name, product_id, status) VALUES (?, ?, ?, ?, ?)',
        [device_id, node_id, device_name, product_id, status || 'INACTIVE']
      );
      
      if (result.affectedRows) {
        return { 
          id: result.insertId, 
          device_id, 
          node_id, 
          device_name, 
          product_id,
          product_name,
          app_id,
          node_type,
          status: status || 'INACTIVE' 
        };
      }
      throw new Error('设备创建失败');
    } catch (error) {
      console.error('创建设备失败:', error);
      throw error;
    }
  }

  /**
   * 更新设备信息
   * @param {string} deviceId 设备ID
   * @param {Object} deviceData 设备数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async updateDevice(deviceId, deviceData) {
    try {
      const { node_id, device_name, product_id, status } = deviceData;
      
      const result = await query(
        'UPDATE devices SET node_id = ?, device_name = ?, product_id = ?, status = ? WHERE device_id = ?',
        [node_id, device_name, product_id, status, deviceId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`更新设备(ID: ${deviceId})失败:`, error);
      throw error;
    }
  }

  /**
   * 删除设备
   * @param {string} deviceId 设备ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async deleteDevice(deviceId) {
    try {
      const result = await query('DELETE FROM devices WHERE device_id = ?', [deviceId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除设备(ID: ${deviceId})失败:`, error);
      throw error;
    }
  }

  /**
   * 保存从云平台获取的设备列表
   * @param {Array} devices 设备列表
   * @returns {Promise<number>} 成功保存的设备数量
   */
  static async saveDevicesFromCloud(devices) {
    if (!Array.isArray(devices) || devices.length === 0) {
      return 0;
    }
    
    let savedCount = 0;
    
    try {
      for (const device of devices) {
        // 检查设备是否已存在
        const existingDevice = await this.getDeviceById(device.device_id);
        
        if (existingDevice) {
          // 更新现有设备
          await this.updateDevice(device.device_id, {
            node_id: device.node_id,
            device_name: device.device_name,
            product_id: device.product_id,
            status: device.status
          });
        } else {
          // 创建新设备
          await this.createDevice({
            device_id: device.device_id,
            node_id: device.node_id,
            device_name: device.device_name,
            product_id: device.product_id,
            status: device.status
          });
        }
        
        savedCount++;
      }
      
      return savedCount;
    } catch (error) {
      console.error('保存云平台设备列表失败:', error);
      throw error;
    }
  }
}

module.exports = DeviceModel; 