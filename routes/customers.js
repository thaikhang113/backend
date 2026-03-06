const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, customerController.getAllCustomers);
// Ai cũng có thể tạo tài khoản (Register) - Không cần auth
router.post('/', customerController.createCustomer); 
// User tự xem/sửa hoặc admin
router.get('/:id', authMiddleware, customerController.getCustomerById);
router.put('/:id', authMiddleware, customerController.updateCustomer);
router.delete('/:id', authMiddleware, customerController.deleteCustomer);

module.exports = router;