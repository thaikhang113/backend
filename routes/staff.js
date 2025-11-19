const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

// Chỉ admin mới xem được danh sách nhân viên và tạo nhân viên
router.get('/', authMiddleware, adminGuard, staffController.getAllStaff);
router.post('/', authMiddleware, adminGuard, staffController.createStaff);

module.exports = router;