<div align="center">

# 🏠 小窝物联网平台 (XW IoT Platform)

</div>

<div align="center">
  
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-14.x+-43853d?logo=node.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?logo=mysql&logoColor=white)
![Huawei Cloud](https://img.shields.io/badge/华为云IoT-SDK-red?logo=huawei&logoColor=white)

</div>

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/0.png" alt="物联网平台示意图" width="600" />
</div>

<div align="center">
  
  📱 **跨平台支持** &nbsp;|&nbsp; 🌐 **实时监控** &nbsp;|&nbsp; ⚡ **高效管理** &nbsp;|&nbsp; 🔒 **安全可靠**
  <p>
    <a href="README_EN.md">🌍 English Documentation</a> &nbsp;|&nbsp; <b>🇨🇳 中文文档</b>
  </p>
</div>

## 📑 目录

- [项目介绍](#-项目介绍)
- [主要特性](#-主要特性)
- [技术栈](#-技术栈)
- [系统架构](#-系统架构)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [系统功能详解](#-系统功能详解)
- [API接口文档](#-api接口文档)
- [华为云IoT平台集成](#-华为云iot平台集成)
- [特别致谢](#-特别致谢)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)
- [联系方式](#-联系方式)

## 🚀 项目介绍

小窝物联网平台是一个基于华为云IoT平台SDK开发的完整物联网解决方案，提供设备管理、产品管理、实时监控和数据可视化等功能。该平台采用前后端分离架构，前端使用Vue.js，后端使用Node.js，为物联网设备提供全生命周期管理服务。

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/favicon.png" alt="快速开始" width="500" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea; padding: 5px; background-color: #fff;" />
</div>

## ✨ 主要特性

- 🏭 **设备管理**：添加、删除、配置物联网设备，一站式管理设备全生命周期
- 📊 **数据监控**：实时查看设备数据和状态，支持历史数据回溯
- 📈 **数据可视化**：通过ECharts图表展示数据趋势，支持多种图表类型
- ⚙️ **产品管理**：管理设备产品类型和服务，支持模型定义
- 🔔 **告警功能**：设置和管理设备告警规则，支持多渠道通知
- 📱 **响应式设计**：支持桌面和移动端访问，随时随地管理设备
- 📄 **完整文档**：提供详细的使用说明和API参考，快速上手
- 🛒 **商城集成**：内置商城页面，实现设备购买与平台的无缝衔接
- 🔄 **命令下发**：支持向设备发送远程控制命令，远程操控
- 🔍 **设备冻结**：支持暂时冻结设备以便维护和更新，确保安全

## 💻 技术栈


### 后端
- 🛠️ **Node.js + Express.js**：构建RESTful API服务
- ☁️ **华为云IoT平台SDK**：@huaweicloud/huaweicloud-sdk-iotda
- 🗄️ **MySQL**：数据存储与管理
- 🔌 **其他**：Axios, Cors, Dotenv

### 前端
- 🖥️ **Vue.js 3**：前端框架，组件化开发
- 🧭 **Vue Router**：路由管理，页面导航
- 📊 **ECharts**：数据可视化，图表展示
- 🎨 **Tailwind CSS**：UI框架，响应式设计
- 🧰 **其他**：@vueuse/core

## 📐 系统架构

```
+------------------+     +------------------+     +-------------------+
|                  |     |                  |     |                   |
|   前端应用       |<--->|   后端API服务    |<--->|   华为云IoT平台   |
|   (Vue.js)       |     |   (Express.js)   |     |                   |
|                  |     |                  |     |                   |
+------------------+     +------------------+     +-------------------+
                                  ^
                                  |
                                  v
                         +------------------+
                         |                  |
                         |   MySQL数据库    |
                         |                  |
                         +------------------+
```

## 📁 项目结构

```
.
├── wlw-backend/          # 后端服务
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── scripts/          # 脚本工具
│   ├── utils/            # 工具函数
│   └── server.js         # 服务器入口
└── wlw-frontend/         # 前端应用
    ├── public/           # 静态资源
    ├── src/              # 源代码
    │   ├── assets/       # 静态资源
    │   ├── components/   # Vue组件
    │   └── router/       # 路由配置
    └── vue.config.js     # Vue配置
```

## 🚦 快速开始

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/2.png" alt="快速开始" width="500" />
</div>

### 环境要求

- Node.js >= 14.x
- MySQL >= 5.7
- 华为云账户与IoT平台访问权限

### 后端设置

1. 克隆仓库
```bash
git clone https://github.com/Chujie-cre/IoT-platform-XW.git
cd IoT-platform-XW
```

2. 安装后端依赖
```bash
cd wlw-backend
npm install
```

3. 配置环境变量
创建`.env`文件并填写以下配置：
```
# 服务器配置
PORT=4000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourDBname

# 华为云配置
HUAWEI_CLOUD_AK=your_access_key
HUAWEI_CLOUD_SK=your_secret_key
HUAWEI_CLOUD_ENDPOINT=https://iotda.cn-north-4.myhuaweicloud.com
HUAWEI_CLOUD_PROJECT_ID=your_project_id
HUAWEICLOUD_REGION_ID=your_region_id
HUAWEICLOUD_APP_ID=your_app_id
```
华为云SDK配置使用方式详情见：https://support.huaweicloud.com/sdkreference-iothub/iot_10_10006.html


4. 启动后端服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 前端设置

1. 安装前端依赖
```bash
cd ../wlw-frontend
npm install
```

2. 配置API地址
如果需要，编辑`.env`文件：
```
VUE_APP_API_URL=http://localhost:4000
```

3. 启动前端开发服务器
```bash
npm run serve
```

4. 构建生产版本
```bash
npm run build
```

## 🔍 系统功能详解

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/1.png" alt="系统功能" width="650" />
</div>

### 前端页面

| 模块 | 功能说明 |
|------|---------|
| **首页** (HomeView) | 系统概览，显示设备和产品统计数据，活跃设备状态监控 |
| **设备管理** (DeviceList) | 设备列表，支持添加、删除、编辑和搜索设备 |
| **设备创建** (DeviceCreate) | 提供设备创建表单，绑定产品类型 |
| **产品管理** (ProductList) | 产品列表，支持添加、删除和编辑产品 |
| **产品创建** (ProductCreate) | 提供产品创建表单，定义产品服务和属性 |
| **服务管理** (ServiceManagementDetail) | 管理设备服务和命令 |
| **设备命令** (DeviceCommandModal) | 向设备发送控制命令 |
| **系统日志** (LogPage) | 查看系统操作和设备事件日志 |
| **用户设置** (SettingsPage) | 系统配置和用户偏好设置 |
| **用户信息** (UserProfile) | 用户个人资料管理 |
| **售后服务** (AfterSalesPage) | 设备维修和售后服务支持 |
| **商城页面** (MallPage) | 内置商城功能，购买设备和配件 |
| **关于页面** (AboutPage) | 系统信息和版本说明 |
| **文档页面** (DocumentPage) | 使用文档和帮助信息 |

### 后端API服务

- **设备管理API**：设备的CRUD操作，同步华为云IoT平台设备数据
- **产品管理API**：产品的CRUD操作，定义设备的产品模型
- **设备属性API**：管理和查询设备属性数据
- **设备冻结API**：暂时冻结设备，用于维护或异常处理
- **产品详情API**：查询产品详细信息和服务定义
- **产品更新API**：更新产品定义和配置
- **日志管理API**：记录和查询系统操作日志
- **健康检查API**：监控系统运行状态

## 📡 API接口文档

### 主要路由

1. **设备管理**：`/api/v1/devices`
   - `GET /` - 获取所有设备列表
   - `GET /:deviceId` - 获取单个设备详情
   - `POST /` - 创建新设备
   - `PUT /:deviceId` - 更新设备信息
   - `DELETE /:deviceId` - 删除设备

2. **产品管理**：`/api/v1/products`
   - `GET /` - 获取所有产品列表
   - `GET /:productId` - 获取单个产品详情
   - `POST /` - 创建新产品
   - `PUT /:productId` - 更新产品信息
   - `DELETE /:productId` - 删除产品

3. **更多API请参考 [API.md](API.md) 文档**

## ☁️ 华为云IoT平台集成

本项目基于华为云物联网平台SDK开发，实现了与华为云IoT服务的无缝集成。主要集成点包括：

### 设备管理

- 设备注册与激活：通过华为云IoT平台API创建和管理设备
- 设备状态同步：实时获取设备在线/离线状态
- 设备影子功能：支持设备影子数据的查询和更新

### 数据传输

- MQTT协议支持：设备通过MQTT协议与平台通信
- 数据上报：设备属性和状态数据上报至云平台
- 数据订阅：后端服务订阅设备数据变更通知

### 命令下发

- 远程控制：向设备发送远程控制命令
- 命令状态跟踪：跟踪命令下发和执行状态
- 批量操作：支持批量命令下发

### 规则引擎

- 数据转发：支持数据转发到其他服务
- 告警规则：配置设备异常告警规则
- 事件处理：处理设备上报的各类事件

## 🙏 特别致谢

- [华为云IoT平台](https://www.huaweicloud.com/product/iothub.html) - 提供物联网设备管理服务
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Express.js](https://expressjs.com/) - Web应用框架

## 🤝 贡献指南

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/your-feature`)
3. 提交你的更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建一个新的 Pull Request

## 📜 许可证

本项目采用 [MIT许可证](LICENSE)。

## 📬 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目维护者: 雏结
- 项目仓库: [GitHub](https://github.com/Chujie-cre/IoT-platform-XW)
- qq群： 597417126

## 💎 赞赏

如果项目对您有帮助，感谢您的赞赏：
<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/IMG_20250504_003312.png" alt="微信赞赏码" width="300" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea; padding: 5px; background-color: #fff; margin: 10px;" />
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/IMG_20250504_003337.jpg" alt="支付宝赞赏码" width="300" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea; padding: 5px; background-color: #fff; margin: 10px;" />
</div>


## ⭐ 星标历史

<div align="center">
  <img src="https://api.star-history.com/svg?repos=Chujie-cre/IoT-platform-XW&type=Date" alt="Star History Chart" width="700" />
  <p>如果您喜欢这个项目，请给我一个星标支持！</p>
</div>
