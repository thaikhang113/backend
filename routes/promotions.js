const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { verifyToken, isStaff } = require('../middleware/auth'); // Nếu có middleware

// Định nghĩa các route con
router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', verifyToken, isStaff, promotionController.createPromotion);
router.put('/:id', verifyToken, isStaff, promotionController.updatePromotion);
router.delete('/:id', verifyToken, isStaff, promotionController.deletePromotion);

module.exports = router;