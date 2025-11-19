const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

router.get('/', authMiddleware, adminGuard, customerController.getAllCustomers);
router.get('/:id', authMiddleware, adminGuard, customerController.getCustomerById);

module.exports = router;