<div align="center">

# 🏠 XW IoT Platform

</div>

<div align="center">
  
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-14.x+-43853d?logo=node.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?logo=mysql&logoColor=white)
![Huawei Cloud](https://img.shields.io/badge/Huawei_Cloud_IoT-SDK-red?logo=huawei&logoColor=white)

</div>

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/0.png" alt="IoT Platform Illustration" width="600" />
</div>

<div align="center">
  
  📱 **Cross-platform Support** &nbsp;|&nbsp; 🌐 **Real-time Monitoring** &nbsp;|&nbsp; ⚡ **Efficient Management** &nbsp;|&nbsp; 🔒 **Secure & Reliable**
  <p>
    <a href="README.md">🇨🇳 中文文档</a> &nbsp;|&nbsp; <b>🌍 English Documentation</b>
  </p>

</div>

## 📑 Table of Contents

- [Project Introduction](#-project-introduction)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [System Functions](#-system-functions)
- [API Documentation](#-api-documentation)
- [Huawei Cloud IoT Platform Integration](#-huawei-cloud-iot-platform-integration)
- [Special Thanks](#-special-thanks)
- [Contribution Guidelines](#-contribution-guidelines)
- [License](#-license)
- [Contact Information](#-contact-information)

## 🚀 Project Introduction

XW IoT Platform is a complete Internet of Things solution developed based on Huawei Cloud IoT Platform SDK, providing device management, product management, real-time monitoring, and data visualization functions. The platform adopts a front-end and back-end separation architecture, with Vue.js for the front-end and Node.js for the back-end, providing full lifecycle management services for IoT devices.

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/favicon.png" alt="IoT Platform Features" width="700" />
</div>

## ✨ Key Features

- 🏭 **Device Management**: Add, delete, and configure IoT devices, one-stop management of device lifecycle
- 📊 **Data Monitoring**: Real-time view of device data and status, with historical data review
- 📈 **Data Visualization**: Display data trends through ECharts charts, supporting various chart types
- ⚙️ **Product Management**: Manage device product types and services, support model definition
- 🔔 **Alarm Function**: Set up and manage device alarm rules, support multi-channel notifications
- 📱 **Responsive Design**: Support desktop and mobile access, manage devices anytime, anywhere
- 📄 **Complete Documentation**: Provide detailed instructions and API references for quick start
- 🛒 **Mall Integration**: Built-in mall page, seamless integration of device purchase and platform
- 🔄 **Command Issuance**: Support sending remote control commands to devices
- 🔍 **Device Freezing**: Support temporarily freezing devices for maintenance and updates, ensuring security

## 💻 Technology Stack

### Backend
- 🛠️ **Node.js + Express.js**: Build RESTful API services
- ☁️ **Huawei Cloud IoT Platform SDK**: @huaweicloud/huaweicloud-sdk-iotda
- 🗄️ **MySQL**: Data storage and management
- 🔌 **Others**: Axios, Cors, Dotenv

### Frontend
- 🖥️ **Vue.js 3**: Frontend framework, component-based development
- 🧭 **Vue Router**: Route management, page navigation
- 📊 **ECharts**: Data visualization, chart display
- 🎨 **Tailwind CSS**: UI framework, responsive design
- 🧰 **Others**: @vueuse/core

## 📐 System Architecture

```
+------------------+     +------------------+     +-------------------+
|                  |     |                  |     |                   |
|   Frontend App   |<--->|   Backend API    |<--->|   Huawei Cloud    |
|   (Vue.js)       |     |   (Express.js)   |     |   IoT Platform    |
|                  |     |                  |     |                   |
+------------------+     +------------------+     +-------------------+
                                  ^
                                  |
                                  v
                         +------------------+
                         |                  |
                         |   MySQL Database |
                         |                  |
                         +------------------+
```

## 📁 Project Structure

```
.
├── wlw-backend/          # Backend service
│   ├── config/           # Configuration files
│   ├── controllers/      # Controllers
│   ├── middleware/       # Middleware
│   ├── models/           # Data models
│   ├── routes/           # Route definitions
│   ├── scripts/          # Script tools
│   ├── utils/            # Utility functions
│   └── server.js         # Server entry
└── wlw-frontend/         # Frontend application
    ├── public/           # Static resources
    ├── src/              # Source code
    │   ├── assets/       # Static assets
    │   ├── components/   # Vue components
    │   └── router/       # Route configuration
    └── vue.config.js     # Vue configuration
```

## 🚦 Quick Start

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/2.png" alt="Quick Start" width="500" />
</div>

### Requirements

- Node.js >= 14.x
- MySQL >= 5.7
- Huawei Cloud account and IoT platform access permissions

### Backend Setup

1. Clone repository
```bash
git clone https://github.com/Chujie-cre/IoT-platform-XW.git
cd IoT-platform-XW
```

2. Install backend dependencies
```bash
cd wlw-backend
npm install
```

3. Configure environment variables
Create a `.env` file and fill in the following configuration:
```
# Server configuration
PORT=4000
NODE_ENV=development

# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourDBname

# Huawei Cloud configuration
HUAWEI_CLOUD_AK=your_access_key
HUAWEI_CLOUD_SK=your_secret_key
HUAWEI_CLOUD_ENDPOINT=https://iotda.cn-north-4.myhuaweicloud.com
HUAWEI_CLOUD_PROJECT_ID=your_project_id
HUAWEICLOUD_REGION_ID=your_region_id
HUAWEICLOUD_APP_ID=your_app_id
```
For details on Huawei Cloud SDK configuration, see: https://support.huaweicloud.com/sdkreference-iothub/iot_10_10006.html


4. Start backend service
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Install frontend dependencies
```bash
cd ../wlw-frontend
npm install
```

2. Configure API address
If needed, edit the `.env` file:
```
VUE_APP_API_URL=http://localhost:4000
```

3. Start frontend development server
```bash
npm run serve
```

4. Build production version
```bash
npm run build
```

## 🔍 System Functions

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/1.png" alt="System Functions" width="650" />
</div>

### Frontend Pages

| Module | Function Description |
|------|---------|
| **Home** (HomeView) | System overview, display device and product statistics, active device status monitoring |
| **Device Management** (DeviceList) | Device list, support adding, deleting, editing, and searching devices |
| **Device Creation** (DeviceCreate) | Provide device creation form, binding product type |
| **Product Management** (ProductList) | Product list, support adding, deleting, and editing products |
| **Product Creation** (ProductCreate) | Provide product creation form, defining product services and properties |
| **Service Management** (ServiceManagementDetail) | Manage device services and commands |
| **Device Command** (DeviceCommandModal) | Send control commands to devices |
| **System Logs** (LogPage) | View system operation and device event logs |
| **User Settings** (SettingsPage) | System configuration and user preferences |
| **User Information** (UserProfile) | User profile management |
| **After-sales Service** (AfterSalesPage) | Device repair and after-sales service support |
| **Mall Page** (MallPage) | Built-in mall functionality, purchase devices and accessories |
| **About Page** (AboutPage) | System information and version details |
| **Documentation Page** (DocumentPage) | Usage documentation and help information |

### Backend API Services

- **Device Management API**: CRUD operations for devices, synchronize Huawei Cloud IoT platform device data
- **Product Management API**: CRUD operations for products, define device product models
- **Device Property API**: Manage and query device property data
- **Device Freeze API**: Temporarily freeze devices for maintenance or abnormal handling
- **Product Details API**: Query product detailed information and service definitions
- **Product Update API**: Update product definitions and configurations
- **Log Management API**: Record and query system operation logs
- **Health Check API**: Monitor system operation status

## 📡 API Documentation

### Main Routes

1. **Device Management**: `/api/v1/devices`
   - `GET /` - Get all devices list
   - `GET /:deviceId` - Get single device details
   - `POST /` - Create new device
   - `PUT /:deviceId` - Update device information
   - `DELETE /:deviceId` - Delete device

2. **Product Management**: `/api/v1/products`
   - `GET /` - Get all products list
   - `GET /:productId` - Get single product details
   - `POST /` - Create new product
   - `PUT /:productId` - Update product information
   - `DELETE /:productId` - Delete product

3. **For more APIs, please refer to the [API.md](API.md) documentation**

## ☁️ Huawei Cloud IoT Platform Integration

This project is developed based on Huawei Cloud IoT Platform SDK, implementing seamless integration with Huawei Cloud IoT services. The main integration points include:

### Device Management

- Device Registration and Activation: Create and manage devices through Huawei Cloud IoT platform APIs
- Device Status Synchronization: Real-time acquisition of device online/offline status
- Device Shadow Functionality: Support for querying and updating device shadow data

### Data Transmission

- MQTT Protocol Support: Devices communicate with the platform through MQTT protocol
- Data Reporting: Device property and status data reported to the cloud platform
- Data Subscription: Backend services subscribe to device data change notifications

### Command Issuance

- Remote Control: Send remote control commands to devices
- Command Status Tracking: Track command issuance and execution status
- Batch Operations: Support batch command issuance

### Rule Engine

- Data Forwarding: Support forwarding data to other services
- Alarm Rules: Configure device abnormal alarm rules
- Event Handling: Process various events reported by devices

## 🙏 Special Thanks

- [Huawei Cloud IoT Platform](https://www.huaweicloud.com/product/iothub.html) - Providing IoT device management services
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Express.js](https://expressjs.com/) - Web application framework

## 🤝 Contribution Guidelines

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 📬 Contact Information

If you have any questions or suggestions, please contact us through:

- Project Maintainer: Chujie
- Project Repository: [GitHub](https://github.com/Chujie-cre/IoT-platform-XW)
