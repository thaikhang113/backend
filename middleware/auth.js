const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. Hàm xác thực (Code mới)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// 2. Hàm phân quyền (Code mới)
const isStaff = (req, res, next) => {
    if (req.user && req.user.is_staff) {
        next();
    } else {
        return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Yêu cầu quyền Nhân viên.' });
    }
};

// --- 3. PHẦN QUAN TRỌNG: GIỮ NGUYÊN ĐỂ KHÔNG BỊ LỖI UNDEFINED ---
// Các file cũ (reviews.js, customers.js...) đang tìm tên 'authMiddleware'
// Dòng này giúp nó hiểu authMiddleware chính là verifyToken
const authMiddleware = verifyToken; 
const adminGuard = isStaff;

module.exports = {
    verifyToken,
    isStaff,
    // Bắt buộc phải export 2 cái tên này thì server mới chạy được:
    authMiddleware,
    adminGuard
};