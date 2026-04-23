const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const customerIdCardUpload = require('../utils/customerIdCardUpload');


router.put('/update-password',customerController.updatePassword);
router.get('/', customerController.getAllCustomers);
// Ai cũng có thể tạo tài khoản (Register) - Không cần auth
router.post(
    '/',
    customerIdCardUpload.fields([
        { name: 'id_card_front', maxCount: 1 },
        { name: 'id_card_back', maxCount: 1 }
    ]),
    customerController.createCustomer
);
// Endpoint mo hoan toan, khong can auth
router.get('/email/:email',customerController.getCustomerByEmail);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.post('/login', customerController.login);
module.exports = router;
