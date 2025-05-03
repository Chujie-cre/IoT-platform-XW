// 数据库连接工具模块
const mysql = require('mysql2/promise');

// 数据库连接池
let pool = null;

/**
 * 初始化数据库连接池
 * @returns {Promise<void>}
 */
async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'iot_platform',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('数据库连接池初始化成功');

    // 验证连接
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();

    // 创建并更新表结构
    await createDevicesTable();
    await migrateDevicesTable();
    
    await createProductsTable();
    await migrateProductsTable();
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

/**
 * 创建设备表（如果不存在）
 * @returns {Promise<void>}
 */
async function createDevicesTable() {
  try {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id VARCHAR(100) UNIQUE,
        node_id VARCHAR(100), 
        name VARCHAR(100) NOT NULL,
        product_id VARCHAR(100),
        status VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableSql);
    console.log('设备表创建或已存在');
  } catch (error) {
    console.error('创建设备表失败:', error);
    throw error;
  }
}

/**
 * 创建产品表（如果不存在）
 * @returns {Promise<void>}
 */
async function createProductsTable() {
  try {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(100) UNIQUE,
        name VARCHAR(100) NOT NULL,
        device_type VARCHAR(50),
        protocol_type VARCHAR(50),
        data_format VARCHAR(50),
        manufacturer_name VARCHAR(100),
        industry VARCHAR(50),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableSql);
    console.log('产品表创建或已存在');
  } catch (error) {
    console.error('创建产品表失败:', error);
    throw error;
  }
}

/**
 * 迁移设备表，添加可能缺少的列
 * @returns {Promise<void>}
 */
async function migrateDevicesTable() {
  try {
    // 检查列是否存在的SQL
    const checkColumnSql = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `;
    
    // 检查device_id列是否存在
    const [deviceIdExists] = await pool.query(
      checkColumnSql, 
      [process.env.DB_NAME || 'iot_platform', 'devices', 'device_id']
    );
    
    if (deviceIdExists.length === 0) {
      console.log('添加device_id列到devices表');
      await pool.query('ALTER TABLE devices ADD device_id VARCHAR(100) UNIQUE');
    }
    
    // 检查node_id列是否存在
    const [nodeIdExists] = await pool.query(
      checkColumnSql, 
      [process.env.DB_NAME || 'iot_platform', 'devices', 'node_id']
    );
    
    if (nodeIdExists.length === 0) {
      console.log('添加node_id列到devices表');
      await pool.query('ALTER TABLE devices ADD node_id VARCHAR(100)');
    }
    
    // 检查created_at列是否存在
    const [createdAtExists] = await pool.query(
      checkColumnSql, 
      [process.env.DB_NAME || 'iot_platform', 'devices', 'created_at']
    );
    
    if (createdAtExists.length === 0) {
      console.log('添加created_at列到devices表');
      await pool.query('ALTER TABLE devices ADD created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    }
    
    // 检查updated_at列是否存在
    const [updatedAtExists] = await pool.query(
      checkColumnSql, 
      [process.env.DB_NAME || 'iot_platform', 'devices', 'updated_at']
    );
    
    if (updatedAtExists.length === 0) {
      console.log('添加updated_at列到devices表');
      await pool.query('ALTER TABLE devices ADD updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }
    
    console.log('设备表迁移完成');
  } catch (error) {
    console.error('迁移设备表失败:', error);
    throw error;
  }
}

/**
 * 迁移产品表，添加可能缺少的列
 * @returns {Promise<void>}
 */
async function migrateProductsTable() {
  try {
    // 检查created_at列是否存在
    const checkColumnSql = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `;
    
    const [createdAtExists] = await pool.query(
      checkColumnSql, 
      [process.env.DB_NAME || 'iot_platform', 'products', 'created_at']
    );
    
    if (createdAtExists.length === 0) {
      console.log('添加created_at列到products表');
      await pool.query('ALTER TABLE products ADD created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    }
    
    const [updatedAtExists] = await pool.query(
      checkColumnSql, 
      [process.env.DB_NAME || 'iot_platform', 'products', 'updated_at']
    );
    
    if (updatedAtExists.length === 0) {
      console.log('添加updated_at列到products表');
      await pool.query('ALTER TABLE products ADD updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }
    
    console.log('产品表迁移完成');
  } catch (error) {
    console.error('迁移产品表失败:', error);
    throw error;
  }
}

/**
 * 获取数据库连接池
 * @returns {Object} 数据库连接池
 */
function getPool() {
  if (!pool) {
    throw new Error('数据库连接池未初始化');
  }
  return pool;
}

/**
 * 执行SQL查询
 * @param {string} sql SQL语句
 * @param {Array} params 参数数组
 * @returns {Promise<Array>} 查询结果
 */
async function query(sql, params = []) {
  try {
    const [rows] = await getPool().query(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL查询失败:', error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  getPool,
  query
}; 