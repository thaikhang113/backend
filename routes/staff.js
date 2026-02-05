const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

// router.get('/', authMiddleware, adminGuard, staffController.getAllStaff);
// router.get('/:id', authMiddleware, adminGuard, staffController.getStaffById);
// router.post('/', authMiddleware, adminGuard, staffController.createStaff);
// router.put('/:id', authMiddleware, adminGuard, staffController.updateStaff);
// router.delete('/:id', authMiddleware, adminGuard, staffController.deleteStaff);

router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;