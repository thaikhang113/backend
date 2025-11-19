const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', reviewController.getReviews);
router.post('/', authMiddleware, reviewController.addReview);

module.exports = router;