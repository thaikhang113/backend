const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

router.get('/', reviewController.getReviews);
router.get('/:id', reviewController.getReviewById);
router.post('/', authMiddleware, reviewController.addReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;