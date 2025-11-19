const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', serviceController.getAllServices); // Public
router.post('/', authMiddleware, serviceController.createService); // Auth required

module.exports = router;