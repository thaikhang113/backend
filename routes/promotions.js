const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', authMiddleware, promotionController.createPromotion);
router.put('/:id', authMiddleware, promotionController.updatePromotion);
router.delete('/:id', authMiddleware, promotionController.deletePromotion);

module.exports = router;