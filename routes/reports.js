const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

router.get('/revenue', authMiddleware, adminGuard, reportController.getRevenueReport);
router.get('/bookings', authMiddleware, adminGuard, reportController.getBookingStats);

module.exports = router;