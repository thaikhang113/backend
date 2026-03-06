const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/revenue', reportController.getRevenueReport);
router.get('/revenue/day', reportController.getRevenueByDay);
router.get('/revenue/month', reportController.getRevenueByMonth);
router.get('/revenue/year', reportController.getRevenueByYear);
router.get('/stats', reportController.getBookingStats);

module.exports = router;