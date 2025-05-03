// 产品详情控制器模块
const huaweiCloud = require('../utils/huaweiCloud');

/**
 * 产品详情控制器类，处理产品详情相关的请求
 */
class ProductDetailController {
  /**
   * 获取产品详细信息
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async getProductDetail(req, res) {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '产品ID不能为空'
        });
      }

      // 从华为云获取产品详细信息
      const productDetail = await huaweiCloud.getProductDetails(productId);
      
      if (!productDetail) {
        return res.status(404).json({
          success: false,
          message: `未找到ID为${productId}的产品`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: '获取产品详情成功',
        data: productDetail
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
}

module.exports = ProductDetailController; 