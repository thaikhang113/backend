const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, invoiceController.createInvoice);

module.exports = router;