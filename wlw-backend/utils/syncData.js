// 数据同步工具模块
const DeviceController = require('../controllers/deviceController');
const DeviceModel = require('../models/device');
const ProductController = require('../controllers/productController');
const ProductModel = require('../models/product');
const database = require('./database');

/**
 * 同步所有数据（设备和产品）
 * @returns {Promise<void>}
 */
async function syncAllData() {
  try {
    console.log('===== 开始同步数据 =====');
    
    // 初始化数据库连接
    await database.initDatabase();
    
    // 同步设备数据
    await syncDevices();
    
    // 同步产品数据
    await syncProducts();
    
    console.log('===== 数据同步完成 =====');
    process.exit(0);
  } catch (error) {
    console.error('数据同步失败:', error);
    process.exit(1);
  }
}

/**
 * 同步设备数据
 * @returns {Promise<void>}
 */
async function syncDevices() {
  try {
    console.log('----- 开始同步设备数据 -----');
    
    // 从华为云IoT平台获取设备列表
    const cloudDevices = await DeviceController.fetchDevicesFromCloud();
    
    if (cloudDevices.length === 0) {
      console.log('云平台没有设备数据');
      return;
    }
    
    console.log(`从云平台获取到${cloudDevices.length}个设备数据`);
    
    // 保存到本地数据库
    const savedCount = await DeviceModel.saveDevicesFromCloud(cloudDevices);
    
    console.log(`成功保存${savedCount}个设备数据到本地数据库`);
    console.log('----- 设备数据同步完成 -----');
  } catch (error) {
    console.error('同步设备数据失败:', error);
    throw error;
  }
}

/**
 * 同步产品数据
 * @returns {Promise<void>}
 */
async function syncProducts() {
  try {
    console.log('----- 开始同步产品数据 -----');
    
    // 从华为云IoT平台获取产品列表
    const cloudProducts = await ProductController.fetchProductsFromCloud();
    
    if (cloudProducts.length === 0) {
      console.log('云平台没有产品数据');
      return;
    }
    
    console.log(`从云平台获取到${cloudProducts.length}个产品数据`);
    
    // 保存到本地数据库
    const savedCount = await ProductModel.saveProductsFromCloud(cloudProducts);
    
    console.log(`成功保存${savedCount}个产品数据到本地数据库`);
    console.log('----- 产品数据同步完成 -----');
  } catch (error) {
    console.error('同步产品数据失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本，则执行同步
if (require.main === module) {
  // 加载环境变量
  require('dotenv').config();
  
  syncAllData();
}

module.exports = {
  syncAllData,
  syncDevices,
  syncProducts
}; 