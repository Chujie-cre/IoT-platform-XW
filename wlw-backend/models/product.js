// 产品模型模块
const { query } = require('../utils/database');

/**
 * 产品模型类，提供产品相关数据操作
 */
class ProductModel {
  /**
   * 获取所有产品列表
   * @returns {Promise<Array>} 产品列表
   */
  static async getAllProducts() {
    try {
      return await query('SELECT * FROM products ORDER BY id DESC');
    } catch (error) {
      console.error('获取所有产品失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取产品
   * @param {string} productId 产品ID
   * @returns {Promise<Object>} 产品信息
   */
  static async getProductById(productId) {
    try {
      const products = await query('SELECT * FROM products WHERE product_id = ?', [productId]);
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(`获取产品(ID: ${productId})失败:`, error);
      throw error;
    }
  }

  /**
   * 创建新产品
   * @param {Object} productData 产品数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createProduct(productData) {
    try {
      const { 
        product_id, 
        name, 
        device_type,
        protocol_type,
        data_format,
        manufacturer_name,
        industry,
        description
      } = productData;
      
      const result = await query(
        `INSERT INTO products (
          product_id, name, device_type, protocol_type, 
          data_format, manufacturer_name, industry, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product_id, 
          name, 
          device_type,
          protocol_type,
          data_format,
          manufacturer_name,
          industry,
          description
        ]
      );
      
      if (result.affectedRows) {
        return { 
          id: result.insertId, 
          ...productData
        };
      }
      throw new Error('产品创建失败');
    } catch (error) {
      console.error('创建产品失败:', error);
      throw error;
    }
  }

  /**
   * 更新产品信息
   * @param {string} productId 产品ID
   * @param {Object} productData 产品数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async updateProduct(productId, productData) {
    try {
      const { 
        name, 
        device_type,
        protocol_type,
        data_format,
        manufacturer_name,
        industry,
        description
      } = productData;
      
      const result = await query(
        `UPDATE products SET 
          name = ?, 
          device_type = ?,
          protocol_type = ?,
          data_format = ?,
          manufacturer_name = ?,
          industry = ?,
          description = ?
        WHERE product_id = ?`,
        [
          name, 
          device_type,
          protocol_type,
          data_format,
          manufacturer_name,
          industry,
          description,
          productId
        ]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`更新产品(ID: ${productId})失败:`, error);
      throw error;
    }
  }

  /**
   * 删除产品
   * @param {string} productId 产品ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async deleteProduct(productId) {
    try {
      const result = await query('DELETE FROM products WHERE product_id = ?', [productId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`删除产品(ID: ${productId})失败:`, error);
      throw error;
    }
  }

  /**
   * 保存从云平台获取的产品列表
   * @param {Array} products 产品列表
   * @returns {Promise<number>} 成功保存的产品数量
   */
  static async saveProductsFromCloud(products) {
    if (!Array.isArray(products) || products.length === 0) {
      return 0;
    }
    
    let savedCount = 0;
    
    try {
      for (const product of products) {
        // 检查产品是否已存在
        const existingProduct = await this.getProductById(product.product_id);
        
        if (existingProduct) {
          // 更新现有产品
          await this.updateProduct(product.product_id, {
            name: product.name,
            device_type: product.device_type,
            protocol_type: product.protocol_type,
            data_format: product.data_format,
            manufacturer_name: product.manufacturer_name,
            industry: product.industry,
            description: product.description
          });
        } else {
          // 创建新产品
          await this.createProduct({
            product_id: product.product_id,
            name: product.name,
            device_type: product.device_type,
            protocol_type: product.protocol_type,
            data_format: product.data_format,
            manufacturer_name: product.manufacturer_name,
            industry: product.industry,
            description: product.description
          });
        }
        
        savedCount++;
      }
      
      return savedCount;
    } catch (error) {
      console.error('保存云平台产品列表失败:', error);
      throw error;
    }
  }
}

module.exports = ProductModel; 