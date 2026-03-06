const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

router.get('/revenue', authMiddleware, reportController.getRevenueReport);
router.get('/revenue/day', authMiddleware, reportController.getRevenueByDay);
router.get('/revenue/month', authMiddleware, reportController.getRevenueByMonth);
router.get('/revenue/year', authMiddleware, reportController.getRevenueByYear);
router.get('/stats', authMiddleware, reportController.getBookingStats);

module.exports = router;