const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceDetail); 
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updatePayment); 
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;