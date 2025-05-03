const huaweiCloud = require('../utils/huaweiCloud');
const iotda = require('@huaweicloud/huaweicloud-sdk-iotda');
const { ListPropertiesRequest } = iotda;

/**
 * 设备属性控制器类，处理设备属性相关的请求
 */
class DevicePropertyController {
  /**
   * 获取设备属性值
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async getDeviceProperties(req, res) {
    try {
      const { deviceId } = req.params;
      const { serviceId } = req.query;

      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: '设备ID不能为空'
        });
      }

      try {
        const client = huaweiCloud.getIoTClient();
        const request = new ListPropertiesRequest();
        request.deviceId = deviceId;
        if (serviceId) {
          request.serviceId = serviceId;
        }

        const result = await client.listProperties(request);
        
        return res.status(200).json({
          success: true,
          message: '获取设备属性成功',
          data: result
        });
      } catch (cloudError) {
        console.error(`从华为云IoT平台获取设备[${deviceId}]属性失败:`, cloudError);
        
        return res.status(404).json({
          success: false,
          message: `获取设备属性失败，未找到ID为${deviceId}的设备或请求无效`,
          error: cloudError.message
        });
      }
    } catch (error) {
      console.error('获取设备属性失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '获取设备属性失败',
        error: error.message
      });
    }
  }
}

module.exports = DevicePropertyController; 