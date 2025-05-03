// 产品控制器模块
const ProductModel = require('../models/product');
const huaweiCloud = require('../utils/huaweiCloud');

/**
 * 产品控制器类，处理产品相关的请求
 */
class ProductController {
  /**
   * 获取所有产品列表
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async getAllProducts(req, res) {
    try {
      // 获取本地数据库中的产品列表
      const localProducts = await ProductModel.getAllProducts();
      
      console.log(`从数据库获取到${localProducts.length}个产品`);
      
      // 如果请求中包含refresh=true参数，则从华为云IoT平台获取最新产品列表
      if (req.query.refresh === 'true') {
        console.log('从华为云IoT平台获取最新产品列表');
        
        try {
          const cloudProducts = await ProductController.fetchProductsFromCloud();
          
          // 将云平台产品信息保存到数据库
          await ProductModel.saveProductsFromCloud(cloudProducts);
          
          // 重新获取数据库中的产品列表（包含新同步的数据）
          const updatedLocalProducts = await ProductModel.getAllProducts();
          
          return res.status(200).json({
            success: true,
            message: '获取产品列表成功（云端已同步）',
            count: updatedLocalProducts.length,
            data: updatedLocalProducts
          });
        } catch (cloudError) {
          console.error('从云平台获取产品失败，返回本地数据:', cloudError);
          
          return res.status(200).json({
            success: true,
            message: '获取产品列表成功（仅本地数据，云同步失败）',
            error: cloudError.message,
            count: localProducts.length,
            data: localProducts
          });
        }
      }
      
      // 返回本地数据库中的产品列表
      return res.status(200).json({
        success: true,
        message: '获取产品列表成功',
        count: localProducts.length,
        data: localProducts
      });
    } catch (error) {
      console.error('获取产品列表失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '获取产品列表失败',
        error: error.message
      });
    }
  }

  /**
   * 获取单个产品详情
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async getProductById(req, res) {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '产品ID不能为空'
        });
      }
      
      const product = await ProductModel.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `未找到ID为${productId}的产品`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: '获取产品详情成功',
        data: product
      });
    } catch (error) {
      console.error('获取产品详情失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '获取产品详情失败',
        error: error.message
      });
    }
  }

  /**
   * 创建新产品
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async createProduct(req, res) {
    try {
      const { 
        name = '',
        device_type = '',
        protocol_type = 'MQTT',
        data_format = 'json',
        manufacturer_name = '',
        industry = '',
        description,
        service_type = '家电',
        service_id = ''
      } = req.body;
      
      // 验证必要字段
      if (!name) {
        return res.status(400).json({
          success: false,
          message: '产品名称不能为空'
        });
      }
      
      // 向华为云IoT平台创建产品
      const cloudProduct = await ProductController.createProductInCloud({
        name,
        device_type,
        protocol_type,
        data_format,
        manufacturer_name,
        industry,
        description,
        service_type,
        service_id
      });
      
      if (!cloudProduct || !cloudProduct.product_id) {
        return res.status(500).json({
          success: false,
          message: '在云平台创建产品失败'
        });
      }
      
      // 将产品信息保存到本地数据库
      const savedProduct = await ProductModel.createProduct({
        product_id: cloudProduct.product_id,
        name: cloudProduct.name || name,
        device_type: cloudProduct.device_type || device_type,
        protocol_type: cloudProduct.protocol_type || protocol_type,
        data_format: cloudProduct.data_format || data_format,
        manufacturer_name: cloudProduct.manufacturer_name || manufacturer_name,
        industry: cloudProduct.industry || industry,
        description: cloudProduct.description || description,
        service_type: service_type,
        service_id: service_id
      });
      
      return res.status(201).json({
        success: true,
        message: '产品创建成功',
        data: savedProduct
      });
    } catch (error) {
      console.error('创建产品失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '创建产品失败',
        error: error.message
      });
    }
  }

  /**
   * 更新产品信息
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updateData = req.body;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '产品ID不能为空'
        });
      }
      
      // 检查产品是否存在
      const existingProduct = await ProductModel.getProductById(productId);
      
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: `未找到ID为${productId}的产品`
        });
      }
      
      // TODO: 实现华为云IoT平台产品更新功能
      // 目前华为云IoT API可能不支持产品更新操作
      
      // 更新本地数据库中的产品信息
      const updated = await ProductModel.updateProduct(productId, updateData);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: '更新产品失败'
        });
      }
      
      // 获取更新后的产品信息
      const updatedProduct = await ProductModel.getProductById(productId);
      
      return res.status(200).json({
        success: true,
        message: '产品更新成功',
        data: updatedProduct
      });
    } catch (error) {
      console.error('更新产品失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '更新产品失败',
        error: error.message
      });
    }
  }

  /**
   * 删除产品
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async deleteProduct(req, res) {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '产品ID不能为空'
        });
      }
      
      // 检查产品是否存在
      const existingProduct = await ProductModel.getProductById(productId);
      
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: `未找到ID为${productId}的产品`
        });
      }
      
      // 从华为云IoT平台删除产品
      await ProductController.deleteProductFromCloud(productId);
      
      // 从本地数据库删除产品
      const deleted = await ProductModel.deleteProduct(productId);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: '删除产品失败'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: '产品删除成功'
      });
    } catch (error) {
      console.error('删除产品失败:', error);
      
      return res.status(500).json({
        success: false,
        message: '删除产品失败',
        error: error.message
      });
    }
  }

  /**
   * 从华为云IoT平台获取产品列表
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<Array>} 产品列表
   */
  static async fetchProductsFromCloud(maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取华为云IoT客户端
        const client = huaweiCloud.getIoTClient();
        
        // 创建请求
        const request = {};
        
        // 发送请求
        console.log(`尝试获取产品列表，第${retries + 1}次尝试`);
        const result = await client.listProducts(request);
        console.log('获取产品列表响应:', JSON.stringify(result, null, 2));
        
        // 处理响应
        if (result && result.products) {
          console.log(`从华为云IoT平台获取到${result.products.length}个产品`);
          return result.products;
        }
        
        return [];
      } catch (error) {
        console.error('从华为云IoT平台获取产品列表失败:', error);
        
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
   * 在华为云IoT平台创建产品
   * @param {Object} productInfo 产品信息
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<Object>} 创建的产品信息
   */
  static async createProductInCloud(productInfo, maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取华为云IoT客户端
        const client = huaweiCloud.getIoTClient();
        
        // 创建请求体，完全按照示例代码格式
        const request = {};
        const body = {};
        
        // 创建服务能力数组
        const listbodyServiceCapabilities = [];
        listbodyServiceCapabilities.push({
          service_id: productInfo.service_id || "",
          service_type: productInfo.service_type || "家电",
          option: "Optional"
        });
        
        // 按照示例代码设置请求字段
        body.service_capabilities = listbodyServiceCapabilities;
        body.data_format = "json";
        body.protocol_type = "MQTT";
        body.device_type = productInfo.device_type || "";
        body.name = productInfo.name || "";
        
        // 设置请求体
        request.body = body;
        
        // 打印请求用于调试
        console.log(`尝试创建产品，第${retries + 1}次尝试`);
        console.log('创建产品请求:', JSON.stringify(request, null, 2));
        
        // 发送请求
        const result = await client.createProduct(request);
        console.log('创建产品响应:', JSON.stringify(result, null, 2));
        
        if (result && result.product_id) {
          console.log('华为云IoT平台创建产品成功:', result.product_id);
          return {
            product_id: result.product_id,
            ...productInfo
          };
        } else {
          throw new Error('创建产品响应中缺少product_id');
        }
      } catch (error) {
        console.error('在华为云IoT平台创建产品失败:', error);
        
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
   * 从华为云IoT平台删除产品
   * @param {string} productId 产品ID
   * @param {number} maxRetries 最大重试次数
   * @param {number} retryDelay 重试延迟时间(毫秒)
   * @returns {Promise<void>}
   */
  static async deleteProductFromCloud(productId, maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // 获取华为云IoT客户端
        const client = huaweiCloud.getIoTClient();
        
        // 创建请求
        const request = {
          product_id: productId
        };
        
        // 发送请求
        console.log(`尝试删除产品(ID: ${productId})，第${retries + 1}次尝试`);
        const result = await client.deleteProduct(request);
        
        console.log(`从华为云IoT平台删除产品(ID: ${productId})成功`, JSON.stringify(result));
        return result;
      } catch (error) {
        console.error(`从华为云IoT平台删除产品(ID: ${productId})失败:`, error);
        
        // 如果是404错误（产品不存在），不抛出异常，视为成功
        if (error.httpStatusCode === 404) {
          console.log(`产品(ID: ${productId})在云平台不存在，视为删除成功`);
          return;
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

module.exports = ProductController; 