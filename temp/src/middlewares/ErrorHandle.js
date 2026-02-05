// src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error("❌ Lỗi hệ thống:", err.stack); // In lỗi ra terminal server để dev xem

    // Trả về cho App iOS một câu thông báo nhẹ nhàng
    res.status(500).json({
        success: false,
        message: "Hệ thống đang bận, vui lòng thử lại sau!", 
        // Không trả err.message thật ra ngoài để tránh lộ thông tin bảo mật
    });
};

module.exports = errorHandler;