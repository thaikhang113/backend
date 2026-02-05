const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

// router.get('/', authMiddleware, adminGuard, invoiceController.getAllInvoices);
// router.get('/:id', authMiddleware, adminGuard, invoiceController.getInvoiceById);
// router.post('/', authMiddleware, adminGuard, invoiceController.createInvoice);
// router.put('/:id', authMiddleware, adminGuard, invoiceController.updateInvoice);
// router.delete('/:id', authMiddleware, adminGuard, invoiceController.deleteInvoice);

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;