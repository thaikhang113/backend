const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

// router.get('/', serviceController.getAllServices);
// router.get('/:id', serviceController.getServiceById);
// router.post('/', authMiddleware, adminGuard, serviceController.createService);
// router.put('/:id', authMiddleware, adminGuard, serviceController.updateService);
// router.delete('/:id', authMiddleware, adminGuard, serviceController.deleteService);

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;