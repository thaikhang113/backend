const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

// Admin thấy tất cả
router.get('/', authMiddleware, adminGuard, customerController.getAllCustomers);
// Ai cũng có thể tạo tài khoản (Register) - Không cần auth
router.post('/', customerController.createCustomer); 
// User tự xem/sửa hoặc admin
router.get('/:id', authMiddleware, customerController.getCustomerById);
router.put('/:id', authMiddleware, customerController.updateCustomer);
// Chỉ admin xóa
router.delete('/:id', authMiddleware, adminGuard, customerController.deleteCustomer);

module.exports = router;