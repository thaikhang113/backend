// src/utils/responseHandler.js

// Hàm trả về thành công
const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data
    });
};

// Hàm trả về lỗi (Dùng cho Controller gọi nhanh)
const sendError = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message: message,
        data: null
    });
};

module.exports = { sendSuccess, sendError };