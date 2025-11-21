const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

router.get('/', authMiddleware, adminGuard, invoiceController.getAllInvoices);
router.get('/:id', authMiddleware, adminGuard, invoiceController.getInvoiceById);
router.post('/', authMiddleware, adminGuard, invoiceController.createInvoice);
router.put('/:id', authMiddleware, adminGuard, invoiceController.updateInvoice);
router.delete('/:id', authMiddleware, adminGuard, invoiceController.deleteInvoice);

module.exports = router;