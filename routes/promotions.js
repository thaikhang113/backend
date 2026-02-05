const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

// router.get('/', promotionController.getAllPromotions);
// router.get('/:id', promotionController.getPromotionById);
// router.post('/', authMiddleware, adminGuard, promotionController.createPromotion);
// router.put('/:id', authMiddleware, adminGuard, promotionController.updatePromotion);
// router.delete('/:id', authMiddleware, adminGuard, promotionController.deletePromotion);

router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', promotionController.createPromotion);
router.put('/:id', promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;