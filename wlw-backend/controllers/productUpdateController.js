// 产品更新控制器模块
const huaweiCloud = require('../utils/huaweiCloud');

/**
 * 产品更新控制器类，处理产品更新相关的请求
 */
class ProductUpdateController {
  /**
   * 更新产品信息
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   * @returns {Promise<void>}
   */
  static async updateProduct(req, res) {
    try {
      const productId = req.query.productId;
      const productData = req.body;
      
      console.log('收到更新产品请求:', {
        productId,
        body: productData,
        contentType: req.headers['content-type']
      });
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '产品ID不能为空'
        });
      }

      // 检查请求体是否为空
      if (!productData || Object.keys(productData).length === 0) {
        return res.status(400).json({
          success: false,
          message: '请求体不能为空'
        });
      }

      // 检查名称是否符合华为云API要求
      if (productData.name) {
        const namePattern = /^[一-龥a-zA-Z0-9_?'#().,&%@!-]{1,64}$/;
        if (!namePattern.test(productData.name)) {
          console.warn(`产品名称 "${productData.name}" 不符合华为云API要求的格式`);
          // 尝试使用符合格式要求的名称
          productData.name = `Product_${Date.now()}`;
          console.log(`已将产品名称修改为: ${productData.name}`);
        }
      }

      // 从华为云更新产品信息
      const updatedProduct = await huaweiCloud.updateProductDetails(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: `更新ID为${productId}的产品失败`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: '更新产品信息成功',
        data: updatedProduct
      });
    } catch (error) {
      console.error('更新产品信息失败:', error);
      
      // 提取华为云API返回的详细错误信息
      let errorMessage = error.message;
      if (error.httpStatusCode && error.errorMsg) {
        errorMessage = `HTTP ${error.httpStatusCode}: ${error.errorMsg}`;
      }
      
      return res.status(500).json({
        success: false,
        message: '更新产品信息失败',
        error: errorMessage
      });
    }
  }
}

module.exports = ProductUpdateController; 