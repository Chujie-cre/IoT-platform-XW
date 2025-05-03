# 小窝物联网平台 API 文档

<div align="center">
  
![API Version](https://img.shields.io/badge/API_Version-v1-blue.svg)
![Status](https://img.shields.io/badge/Status-stable-green.svg)

</div>

## 目录

- [概述](#概述)
- [认证方式](#认证方式)
- [基础URL](#基础url)
- [请求格式](#请求格式)
- [响应格式](#响应格式)
- [错误码](#错误码)
- [API 端点](#api-端点)
  - [设备管理](#设备管理)
  - [产品管理](#产品管理)
  - [产品详情](#产品详情)
  - [产品更新](#产品更新)
  - [设备属性](#设备属性)
  - [设备冻结](#设备冻结)
  - [日志管理](#日志管理)
  - [健康检查](#健康检查)
- [前端路由](#前端路由)
- [前后端对接](#前后端对接)
- [WebSocket接口](#websocket接口)
- [数据模型](#数据模型)

## 概述

这是小窝物联网平台的API文档，详细描述了平台提供的所有接口。本平台是一个物联网全栈项目，分为前端和后端两部分：
- **前端**：基于Vue.js的单页应用
- **后端**：基于Express.js的RESTful API服务
- **数据库**：采用MySQL

本API文档主要针对后端API接口进行说明，供前端开发人员和第三方集成使用。

## 认证方式

API使用基于Token的认证机制：

1. 客户端通过登录接口获取Token
2. 后续请求在HTTP头部添加认证信息：
   ```
   Authorization: Bearer {your_token}
   ```
3. Token有效期为24小时，过期后需要重新获取

## 基础URL

所有API请求都基于以下基础URL：

```
http://{server_ip}:{port}/api/v1
```

- 开发环境：`http://localhost:3000/api/v1`
- 生产环境：根据部署情况配置

## 请求格式

API请求应该使用JSON格式提交数据：

```http
Content-Type: application/json
```

## 响应格式

所有API响应均为JSON格式，包含以下字段：

```json
{
  "success": true/false,       // 请求是否成功
  "message": "描述信息",        // 响应消息
  "data": { ... } / [ ... ],   // 响应数据（对象或数组）
  "timestamp": "2023-11-10T08:15:30Z" // 响应时间戳
}
```

## 错误码

| 状态码 | 错误类型 | 说明 |
|-------|---------|-----|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或认证失败 |
| 403 | Forbidden | 无访问权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 500 | Internal Server Error | 服务器内部错误 |

## API 端点

### 设备管理

#### 获取所有设备列表

- **URL**: `/devices`
- **方法**: `GET`
- **URL参数**:
  - `page=[integer]` - 页码，默认为1
  - `limit=[integer]` - 每页条数，默认为10
  - `sort=[string]` - 排序字段，默认为'createdAt'
  - `order=[string]` - 排序方式，'asc'或'desc'，默认为'desc'
  - `search=[string]` - 搜索关键词

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功获取设备列表",
    "data": {
      "devices": [
        {
          "deviceId": "device123",
          "deviceName": "智能温控器",
          "productId": "product456",
          "status": "online",
          "createdAt": "2023-11-10T08:15:30Z",
          "lastOnlineTime": "2023-11-10T08:15:30Z"
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "totalPages": 10
      }
    }
  }
  ```

#### 获取单个设备详情

- **URL**: `/devices/:deviceId`
- **方法**: `GET`
- **URL参数**: 无

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功获取设备详情",
    "data": {
      "deviceId": "device123",
      "deviceName": "智能温控器",
      "productId": "product456",
      "status": "online",
      "createdAt": "2023-11-10T08:15:30Z",
      "lastOnlineTime": "2023-11-10T08:15:30Z",
      "properties": {
        "temperature": 25.5,
        "humidity": 60
      }
    }
  }
  ```

#### 创建新设备

- **URL**: `/devices`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "deviceName": "新智能温控器",
    "productId": "product456",
    "description": "客厅温控器"
  }
  ```

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "设备创建成功",
    "data": {
      "deviceId": "device789",
      "deviceName": "新智能温控器",
      "productId": "product456",
      "status": "offline",
      "createdAt": "2023-11-10T08:15:30Z"
    }
  }
  ```

#### 更新设备信息

- **URL**: `/devices/:deviceId`
- **方法**: `PUT`
- **请求体**:
  ```json
  {
    "deviceName": "更新后的温控器",
    "description": "卧室温控器"
  }
  ```

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "设备更新成功",
    "data": {
      "deviceId": "device123",
      "deviceName": "更新后的温控器",
      "description": "卧室温控器",
      "updatedAt": "2023-11-10T08:15:30Z"
    }
  }
  ```

#### 删除设备

- **URL**: `/devices/:deviceId`
- **方法**: `DELETE`

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "设备删除成功",
    "data": {
      "deviceId": "device123"
    }
  }
  ```

### 产品管理

#### 获取所有产品列表

- **URL**: `/products`
- **方法**: `GET`
- **URL参数**:
  - `page=[integer]` - 页码，默认为1
  - `limit=[integer]` - 每页条数，默认为10
  - `sort=[string]` - 排序字段，默认为'createdAt'
  - `order=[string]` - 排序方式，'asc'或'desc'，默认为'desc'
  - `search=[string]` - 搜索关键词

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功获取产品列表",
    "data": {
      "products": [
        {
          "productId": "product456",
          "productName": "智能温控器",
          "deviceCount": 10,
          "createdAt": "2023-11-10T08:15:30Z"
        }
      ],
      "pagination": {
        "total": 50,
        "page": 1,
        "limit": 10,
        "totalPages": 5
      }
    }
  }
  ```

#### 获取单个产品详情

- **URL**: `/products/:productId`
- **方法**: `GET`

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "成功获取产品详情",
    "data": {
      "productId": "product456",
      "productName": "智能温控器",
      "description": "家用智能温控器，支持远程控制",
      "model": "TC-100",
      "manufacturer": "小窝科技",
      "createdAt": "2023-11-10T08:15:30Z",
      "services": [
        {
          "serviceId": "temperature_control",
          "serviceName": "温度控制",
          "properties": [
            {
              "propertyId": "temperature",
              "propertyName": "温度",
              "dataType": "float",
              "unit": "°C",
              "min": 16,
              "max": 30
            }
          ],
          "commands": [
            {
              "commandId": "set_temperature",
              "commandName": "设置温度"
            }
          ]
        }
      ]
    }
  }
  ```

#### 创建新产品

- **URL**: `/products`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "productName": "智能灯泡",
    "description": "支持调光调色的智能灯泡",
    "model": "BL-200",
    "manufacturer": "小窝科技"
  }
  ```

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "产品创建成功",
    "data": {
      "productId": "product789",
      "productName": "智能灯泡",
      "description": "支持调光调色的智能灯泡",
      "model": "BL-200",
      "manufacturer": "小窝科技",
      "createdAt": "2023-11-10T08:15:30Z"
    }
  }
  ```

#### 更新产品信息

- **URL**: `/products/:productId`
- **方法**: `PUT`
- **请求体**:
  ```json
  {
    "productName": "升级版智能灯泡",
    "description": "支持多彩调光的智能灯泡"
  }
  ```

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "产品更新成功",
    "data": {
      "productId": "product789",
      "productName": "升级版智能灯泡",
      "description": "支持多彩调光的智能灯泡",
      "updatedAt": "2023-11-10T08:15:30Z"
    }
  }
  ```

#### 删除产品

- **URL**: `/products/:productId`
- **方法**: `DELETE`

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "产品删除成功",
    "data": {
      "productId": "product789"
    }
  }
  ```

### 产品详情

#### 获取产品详情

- **URL**: `/product-details/:productId`
- **方法**: `GET`

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "获取产品详情成功",
    "data": {
      "productId": "product456",
      "productName": "智能温控器",
      "description": "家用智能温控器，支持远程控制",
      "specifications": {
        "dimensions": "120mm x 80mm x 20mm",
        "weight": "150g",
        "powerSupply": "220V AC",
        "protocol": "MQTT"
      },
      "features": [
        "温度调控",
        "定时控制",
        "智能场景联动"
      ]
    }
  }
  ```

### 产品更新

#### 更新产品服务

- **URL**: `/product-update/:productId/services`
- **方法**: `PUT`
- **请求体**:
  ```json
  {
    "services": [
      {
        "serviceId": "light_control",
        "serviceName": "灯光控制",
        "properties": [
          {
            "propertyId": "brightness",
            "propertyName": "亮度",
            "dataType": "integer",
            "unit": "%",
            "min": 0,
            "max": 100
          },
          {
            "propertyId": "color_temperature",
            "propertyName": "色温",
            "dataType": "integer",
            "unit": "K",
            "min": 2700,
            "max": 6500
          }
        ]
      }
    ]
  }
  ```

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "产品服务更新成功",
    "data": {
      "productId": "product789",
      "serviceCount": 1,
      "updatedAt": "2023-11-10T08:15:30Z"
    }
  }
  ```

### 设备属性

#### 获取设备属性

- **URL**: `/device-properties/:deviceId`
- **方法**: `GET`

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "获取设备属性成功",
    "data": {
      "deviceId": "device123",
      "properties": {
        "temperature": 25.5,
        "humidity": 60,
        "mode": "auto"
      },
      "timestamp": "2023-11-10T08:15:30Z"
    }
  }
  ```

#### 设置设备属性

- **URL**: `/device-properties/:deviceId`
- **方法**: `PUT`
- **请求体**:
  ```json
  {
    "properties": {
      "temperature": 26.5,
      "mode": "manual"
    }
  }
  ```

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "设备属性设置成功",
    "data": {
      "deviceId": "device123",
      "updatedProperties": ["temperature", "mode"],
      "timestamp": "2023-11-10T08:15:30Z"
    }
  }
  ```

### 设备冻结

#### 冻结设备

- **URL**: `/device-freeze/:deviceId/freeze`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "reason": "设备维护",
    "duration": 86400  // 冻结时长，单位秒，此处为1天
  }
  ```

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "设备冻结成功",
    "data": {
      "deviceId": "device123",
      "freezeStatus": true,
      "reason": "设备维护",
      "freezeTime": "2023-11-10T08:15:30Z",
      "unfreezeTime": "2023-11-11T08:15:30Z"
    }
  }
  ```

#### 解冻设备

- **URL**: `/device-freeze/:deviceId/unfreeze`
- **方法**: `POST`

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "设备解冻成功",
    "data": {
      "deviceId": "device123",
      "freezeStatus": false,
      "unfreezeTime": "2023-11-10T10:15:30Z"
    }
  }
  ```

#### 获取设备冻结状态

- **URL**: `/device-freeze/:deviceId/status`
- **方法**: `GET`

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "获取设备冻结状态成功",
    "data": {
      "deviceId": "device123",
      "freezeStatus": true,
      "reason": "设备维护",
      "freezeTime": "2023-11-10T08:15:30Z",
      "unfreezeTime": "2023-11-11T08:15:30Z",
      "remainingTime": 64800  // 剩余冻结时间，单位秒
    }
  }
  ```

### 日志管理

#### 获取系统日志

- **URL**: `/logs`
- **方法**: `GET`
- **URL参数**:
  - `page=[integer]` - 页码，默认为1
  - `limit=[integer]` - 每页条数，默认为20
  - `type=[string]` - 日志类型，可选: 'system', 'device', 'user', 'all'
  - `startTime=[ISO8601]` - 起始时间，ISO8601格式
  - `endTime=[ISO8601]` - 结束时间，ISO8601格式
  - `level=[string]` - 日志级别，可选: 'info', 'warning', 'error', 'all'

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "获取日志成功",
    "data": {
      "logs": [
        {
          "logId": "log123",
          "timestamp": "2023-11-10T08:15:30Z",
          "type": "device",
          "level": "info",
          "message": "设备device123上线",
          "details": {
            "deviceId": "device123",
            "event": "online"
          }
        }
      ],
      "pagination": {
        "total": 1520,
        "page": 1,
        "limit": 20,
        "totalPages": 76
      }
    }
  }
  ```

#### 获取设备日志

- **URL**: `/logs/device/:deviceId`
- **方法**: `GET`
- **URL参数**:
  - `page=[integer]` - 页码，默认为1
  - `limit=[integer]` - 每页条数，默认为20
  - `startTime=[ISO8601]` - 起始时间，ISO8601格式
  - `endTime=[ISO8601]` - 结束时间，ISO8601格式
  - `level=[string]` - 日志级别，可选: 'info', 'warning', 'error', 'all'

- **成功响应**:
  ```json
  {
    "success": true,
    "message": "获取设备日志成功",
    "data": {
      "deviceId": "device123",
      "logs": [
        {
          "logId": "log456",
          "timestamp": "2023-11-10T08:15:30Z",
          "level": "info",
          "message": "设备属性更新",
          "details": {
            "properties": {
              "temperature": 26.5
            }
          }
        }
      ],
      "pagination": {
        "total": 150,
        "page": 1,
        "limit": 20,
        "totalPages": 8
      }
    }
  }
  ```

### 健康检查

#### 服务健康检查

- **URL**: `/health`
- **方法**: `GET`

- **成功响应**:
  ```json
  {
    "status": "OK",
    "timestamp": "2023-11-10T08:15:30Z",
    "message": "服务器运行正常",
    "config": {
      "env": "development",
      "endpoint": "https://iotda.cn-north-4.myhuaweicloud.com"
    },
    "services": {
      "database": "connected",
      "huaweicloud": "connected"
    },
    "uptime": 1234567  // 服务运行时间，单位秒
  }
  ```

## 前端路由

前端使用Vue Router管理路由，主要页面包括：

| 路由路径 | 页面名称 | 说明 |
|---------|----------|-----|
| `/` | 首页 | 系统概览，显示数据统计和设备状态 |
| `/devices` | 设备管理 | 设备列表、创建和管理页面 |
| `/products` | 产品管理 | 产品列表、创建和管理页面 |
| `/docs` | 文档页面 | 系统使用文档 |
| `/mall` | 商城页面 | 设备购买页面 |
| `/after-sales` | 售后服务 | 设备售后服务页面 |
| `/logs` | 系统日志 | 查看系统和设备日志 |
| `/settings` | 设置页面 | 系统设置 |
| `/user` | 用户个人信息 | 用户信息管理 |
| `/about` | 关于页面 | 系统信息和版本说明 |

## 前后端对接

前端通过API调用与后端进行交互，例如：

- 设备列表页面调用 `/api/v1/devices` 获取设备数据
- 产品列表页面调用 `/api/v1/products` 获取产品数据
- 商城页面通过iframe嵌入外部页面 `http://mall.kingdomofown.cn`

## WebSocket接口

系统提供WebSocket接口，用于接收实时数据和事件通知：

- **WebSocket URL**: `ws://{server_ip}:{port}/ws`
- **认证**: 通过URL参数传递token: `ws://{server_ip}:{port}/ws?token={your_token}`

### 消息格式

```json
{
  "type": "device_status", // 消息类型
  "timestamp": "2023-11-10T08:15:30Z",
  "data": {
    "deviceId": "device123",
    "status": "online"
  }
}
```

### 消息类型

| 类型 | 说明 | 数据格式 |
|-----|------|---------|
| `device_status` | 设备状态变更 | `{"deviceId": "xxx", "status": "online/offline"}` |
| `property_update` | 设备属性更新 | `{"deviceId": "xxx", "properties": {...}}` |
| `event_notification` | 事件通知 | `{"deviceId": "xxx", "eventType": "xxx", "params": {...}}` |
| `command_response` | 命令响应 | `{"deviceId": "xxx", "commandId": "xxx", "result": {...}}` |
| `system_notification` | 系统通知 | `{"level": "xxx", "message": "xxx"}` |

## 数据模型

### 设备模型

```json
{
  "deviceId": "string",        // 设备ID
  "deviceName": "string",      // 设备名称
  "productId": "string",       // 所属产品ID
  "status": "string",          // 设备状态: online, offline, disabled
  "createdAt": "date",         // 创建时间
  "updatedAt": "date",         // 更新时间
  "lastOnlineTime": "date",    // 最后在线时间
  "properties": "object",      // 设备属性
  "tags": "array",             // 设备标签
  "location": {                // 设备位置
    "longitude": "number",     // 经度
    "latitude": "number",      // 纬度
    "address": "string"        // 地址
  }
}
```

### 产品模型

```json
{
  "productId": "string",       // 产品ID
  "productName": "string",     // 产品名称
  "description": "string",     // 产品描述
  "model": "string",           // 产品型号
  "manufacturer": "string",    // 制造商
  "createdAt": "date",         // 创建时间
  "updatedAt": "date",         // 更新时间
  "services": "array",         // 产品服务定义
  "properties": "object",      // 产品属性
  "deviceCount": "number"      // 设备数量
}
```

### 日志模型

```json
{
  "logId": "string",           // 日志ID
  "timestamp": "date",         // 时间戳
  "type": "string",            // 日志类型: system, device, user
  "level": "string",           // 日志级别: info, warning, error
  "message": "string",         // 日志消息
  "details": "object",         // 详细信息
  "deviceId": "string",        // 相关设备ID
  "userId": "string"           // 相关用户ID
}
```
