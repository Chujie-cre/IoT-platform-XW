const { getIoTClient } = require('../utils/huaweiCloud');
const iotda = require("@huaweicloud/huaweicloud-sdk-iotda/v5/public-api");

// 冻结设备
const freezeDevice = async (req, res) => {
    try {
        const deviceId = req.headers['device-id'];
        
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: '设备ID不能为空，请在请求头中提供device-id'
            });
        }

        const client = getIoTClient();
        const request = new iotda.FreezeDeviceRequest();
        request.deviceId = deviceId;

        const result = await client.freezeDevice(request);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('冻结设备失败:', error);
        res.status(500).json({
            success: false,
            message: '冻结设备失败',
            error: error.message
        });
    }
};

// 解冻设备
const unfreezeDevice = async (req, res) => {
    try {
        const deviceId = req.headers['device-id'];
        
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: '设备ID不能为空，请在请求头中提供device-id'
            });
        }

        const client = getIoTClient();
        const request = new iotda.UnfreezeDeviceRequest();
        request.deviceId = deviceId;

        const result = await client.unfreezeDevice(request);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('解冻设备失败:', error);
        res.status(500).json({
            success: false,
            message: '解冻设备失败',
            error: error.message
        });
    }
};

module.exports = {
    freezeDevice,
    unfreezeDevice
}; 