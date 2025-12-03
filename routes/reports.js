const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/revenue', reportController.generateRevenueReport); 
router.get('/dashboard', reportController.getDashboard);
router.get('/', reportController.getAllReports);
router.delete('/:id', reportController.deleteReport);

module.exports = router;