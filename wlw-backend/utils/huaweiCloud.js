// 华为云IoT SDK工具模块
const core = require('@huaweicloud/huaweicloud-sdk-core');
const iotda = require('@huaweicloud/huaweicloud-sdk-iotda');
const axios = require('axios');

/**
 * 获取华为云IoT客户端
 * @param {string} customProjectId 自定义项目ID，优先级高于环境变量
 * @returns {Object} 华为云IoT客户端实例
 */
function getIoTClient(customProjectId) {
  // 从环境变量获取认证信息
  const ak = process.env.HUAWEICLOUD_SDK_AK;
  const sk = process.env.HUAWEICLOUD_SDK_SK;
  const projectId = customProjectId || process.env.HUAWEICLOUD_PROJECT_ID;
  // 去掉projectId中的连字符，以符合API要求的正则表达式 ^[a-fA-F0-9]{1,32}$
  const formattedProjectId = projectId.replace(/-/g, '');
  
  // 处理endpoint，确保格式正确
  let endpoint = process.env.HUAWEICLOUD_ENDPOINT;
  // 首先确保endpoint不包含https://前缀
  if(endpoint.startsWith('https://')) {
    endpoint = endpoint.replace('https://', '');
  }
  
  // 创建完整的https://前缀URL，用于SDK
  const endpointUrl = `https://${endpoint}`;
  
  const regionId = process.env.HUAWEICLOUD_REGION_ID;

  // 打印配置信息（不包含敏感信息）
  console.log('SDK配置信息:');
  console.log('- 区域ID:', regionId);
  console.log('- 端点:', endpoint);
  console.log('- 完整URL:', endpointUrl);
  console.log('- 项目ID:', projectId);
  console.log('- 格式化后项目ID:', formattedProjectId);
  console.log('- AK长度:', ak ? ak.length : 0);
  console.log('- SK长度:', sk ? sk.length : 0);

  try {
    // 创建认证对象
    const credentials = new core.BasicCredentials()
      .withAk(ak)
      .withSk(sk)
      .withDerivedPredicate(core.BasicCredentials.getDefaultDerivedPredicate)
      .withProjectId(formattedProjectId); // 使用格式化后的projectId

    console.log('认证对象创建成功');

    // 创建并返回客户端，使用完整的URL
    return iotda.IoTDAClient.newBuilder()
      .withCredential(credentials)
      .withEndpoint(endpointUrl)
      .withRegion(new core.Region(regionId, endpointUrl))
      .build();
  } catch (error) {
    console.error('创建IoT客户端失败:', error);
    throw error;
  }
}

/**
 * 直接更新设备信息，不使用SDK
 * @param {string} deviceId 设备ID
 * @param {Object} deviceData 设备数据
 * @returns {Promise<Object>} API响应
 */
async function updateDeviceDirectly(deviceId, deviceData) {
  try {
    // 获取认证信息和配置
    const ak = process.env.HUAWEICLOUD_SDK_AK;
    const sk = process.env.HUAWEICLOUD_SDK_SK;
    const projectId = process.env.HUAWEICLOUD_PROJECT_ID;
    // 去掉连字符
    const formattedProjectId = projectId.replace(/-/g, '');
    
    // 确保endpoint格式正确
    let endpoint = process.env.HUAWEICLOUD_ENDPOINT;
    if(endpoint.startsWith('https://')) {
      endpoint = endpoint.replace('https://', '');
    }
    
    // 构建URL时避免双重https://
    const url = `https://${endpoint}/v5/iot/${formattedProjectId}/devices/${deviceId}`;
    
    console.log('向华为云IoT平台发送直接更新设备请求:', url);
    console.log('请求体:', deviceData);
    
    // 发送请求
    const response = await axios.put(url, deviceData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-AK': ak,
        'X-Auth-SK': sk,
        'X-Project-Id': formattedProjectId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('直接更新设备失败:', error);
    throw error;
  }
}

/**
 * 生成符合华为云IoT平台要求的节点ID
 * @param {string} device_name 设备名称
 * @param {string} deviceId 可选的设备ID
 * @returns {string} 符合格式要求的节点ID
 */
function generateValidNodeId(device_name, deviceId) {
  // 如果提供了device_id就使用它，否则基于name生成一个合法的ID
  let nodeId = deviceId || '';
  if (!nodeId) {
    // 如果没有提供device_id，根据name生成一个唯一标识符
    // 移除所有不符合要求的字符，用下划线替代
    nodeId = device_name.replace(/[^a-zA-Z0-9:_-]/g, '_');
    
    // 确保第一个字符是字母或数字
    if (!/^[a-zA-Z0-9]/.test(nodeId)) {
      nodeId = 'device_' + nodeId;
    }
    
    // 添加时间戳确保唯一性
    nodeId += '_' + Date.now();
  }
  
  return nodeId;
}

/**
 * 验证节点ID是否符合华为云IoT平台的格式要求
 * @param {string} nodeId 要验证的节点ID
 * @returns {boolean} 是否合法
 */
function isValidNodeId(nodeId) {
  return /^[a-zA-Z0-9:_-]{1,64}$/.test(nodeId);
}

/**
 * 获取产品详细信息
 * @param {string} productId 产品ID
 * @returns {Promise<Object>} 产品详细信息
 */
async function getProductDetails(productId) {
  try {
    console.log(`开始获取产品 ${productId} 的详细信息`);
    const client = getIoTClient();
    
    // 构建请求对象
    const request = new iotda.ShowProductRequest();
    request.productId = productId;
    
    console.log(`发送请求获取产品详情: productId=${productId}`);
    
    // 发送请求并等待响应
    const result = await client.showProduct(request);
    console.log(`成功获取产品详情`);
    
    return result;
  } catch (error) {
    console.error(`获取产品详情失败: ${error.message}`, error);
    throw error;
  }
}

/**
 * 更新产品信息
 * @param {string} productId 产品ID
 * @param {Object} productData 产品数据
 * @returns {Promise<Object>} 更新后的产品信息
 */
async function updateProductDetails(productId, productData) {
  try {
    console.log(`开始更新产品 ${productId} 的信息`, JSON.stringify(productData));
    const client = getIoTClient();
    
    // 构建请求对象
    const request = new iotda.UpdateProductRequest();
    request.productId = productId;
    
    // 构建请求体
    const body = new iotda.UpdateProduct();
    
    // 设置产品属性
    if (productData.name) {
      console.log(`设置产品名称: ${productData.name}`);
      body.withName(productData.name);
    }
    if (productData.device_type) body.withDeviceType(productData.device_type);
    if (productData.protocol_type) body.withProtocolType(productData.protocol_type);
    if (productData.data_format) body.withDataFormat(productData.data_format);
    if (productData.manufacturer_name) body.withManufacturerName(productData.manufacturer_name);
    if (productData.industry) body.withIndustry(productData.industry);
    if (productData.description) body.withDescription(productData.description);
    
    // 处理服务能力
    if (productData.service_capabilities && productData.service_capabilities.length > 0) {
      console.log(`设置产品服务能力: ${productData.service_capabilities.length}个服务`);
      
      // 创建服务能力数组
      const serviceCapabilities = [];
      
      // 遍历服务
      for (const service of productData.service_capabilities) {
        // 创建服务对象
        const serviceCapability = new iotda.ServiceCapability();
        
        // 设置服务基本信息
        serviceCapability.withServiceId(service.service_id);
        serviceCapability.withServiceType(service.service_type);
        if (service.description) serviceCapability.withDescription(service.description);
        if (service.option) serviceCapability.withOption(service.option);
        
        // 处理属性
        if (service.properties && service.properties.length > 0) {
          const properties = [];
          
          // 遍历属性
          for (const prop of service.properties) {
            // 创建属性对象
            const property = new iotda.ServiceProperty();
            
            // 设置属性基本信息
            property.withPropertyName(prop.property_name);
            property.withDataType(prop.data_type);
            property.withRequired(prop.required);
            property.withMethod(prop.method);
            
            // 设置可选字段
            if (prop.enum_list) property.withEnumList(prop.enum_list);
            if (prop.min) property.withMin(prop.min);
            if (prop.max) property.withMax(prop.max);
            if (prop.max_length !== undefined && prop.max_length !== null) 
              property.withMaxLength(prop.max_length);
            if (prop.step !== undefined && prop.step !== null) 
              property.withStep(prop.step);
            if (prop.unit) property.withUnit(prop.unit);
            if (prop.description) property.withDescription(prop.description);
            if (prop.default_value !== undefined && prop.default_value !== null) 
              property.withDefaultValue(prop.default_value);
            
            // 添加到属性列表
            properties.push(property);
          }
          
          // 设置服务属性
          serviceCapability.withProperties(properties);
        }
        
        // 处理命令
        if (service.commands && service.commands.length > 0) {
          const commands = [];
          
          // 遍历命令
          for (const cmd of service.commands) {
            // 创建命令对象
            const command = new iotda.ServiceCommand();
            
            // 设置命令基本信息
            command.withCommandName(cmd.command_name);
            
            // 处理参数
            if (cmd.paras && cmd.paras.length > 0) {
              const paras = [];
              
              // 遍历参数
              for (const para of cmd.paras) {
                // 创建参数对象
                const parameter = new iotda.ServiceCommandPara();
                
                // 设置参数基本信息
                parameter.withParaName(para.para_name);
                parameter.withDataType(para.data_type);
                parameter.withRequired(para.required);
                
                // 设置可选字段
                if (para.enum_list) parameter.withEnumList(para.enum_list);
                if (para.min) parameter.withMin(para.min);
                if (para.max) parameter.withMax(para.max);
                if (para.max_length !== undefined && para.max_length !== null) 
                  parameter.withMaxLength(para.max_length);
                if (para.step !== undefined && para.step !== null) 
                  parameter.withStep(para.step);
                if (para.unit) parameter.withUnit(para.unit);
                if (para.description) parameter.withDescription(para.description);
                
                // 添加到参数列表
                paras.push(parameter);
              }
              
              // 设置命令参数
              command.withParas(paras);
            }
            
            // 处理响应
            if (cmd.responses) {
              command.withResponses(cmd.responses);
            }
            
            // 添加到命令列表
            commands.push(command);
          }
          
          // 设置服务命令
          serviceCapability.withCommands(commands);
        }
        
        // 处理事件
        if (service.events && service.events.length > 0) {
          // 事件处理逻辑（根据需要添加）
          serviceCapability.withEvents(service.events);
        }
        
        // 添加到服务能力列表
        serviceCapabilities.push(serviceCapability);
      }
      
      // 设置产品服务能力
      body.withServiceCapabilities(serviceCapabilities);
    }
    
    // 打印请求体内容，便于调试
    console.log('UpdateProduct请求体:', JSON.stringify(body));
    
    request.withBody(body);
    
    console.log(`发送请求更新产品信息: productId=${productId}`);
    
    // 发送请求并等待响应
    const result = await client.updateProduct(request);
    console.log(`成功更新产品信息`, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error(`更新产品信息失败: ${error.message}`, error);
    throw error;
  }
}

module.exports = {
  getIoTClient,
  generateValidNodeId,
  isValidNodeId,
  updateDeviceDirectly,
  getProductDetails,
  updateProductDetails,
  // 导出SDK客户端，不导出构造函数
  IoTDAClient: iotda.IoTDAClient
}; 