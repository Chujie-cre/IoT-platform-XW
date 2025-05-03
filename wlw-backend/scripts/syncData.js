#!/usr/bin/env node

// 数据同步脚本
const { syncAllData } = require('../utils/syncData');

// 加载环境变量
require('dotenv').config();

// 执行同步
console.log('正在从华为云IoT平台同步数据到本地数据库...');
syncAllData(); 