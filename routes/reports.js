const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

router.get('/revenue', authMiddleware, adminGuard, reportController.getRevenueReport);
router.get('/revenue/day', authMiddleware, adminGuard, reportController.getRevenueByDay);
router.get('/revenue/month', authMiddleware, adminGuard, reportController.getRevenueByMonth);
router.get('/revenue/year', authMiddleware, adminGuard, reportController.getRevenueByYear);
router.get('/stats', authMiddleware, adminGuard, reportController.getBookingStats);

module.exports = router;