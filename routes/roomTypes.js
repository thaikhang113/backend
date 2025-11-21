const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

router.get('/', roomTypeController.getAllRoomTypes);
router.get('/:id', roomTypeController.getRoomTypeById);
router.post('/', authMiddleware, adminGuard, roomTypeController.createRoomType);
router.put('/:id', authMiddleware, adminGuard, roomTypeController.updateRoomType);
router.delete('/:id', authMiddleware, adminGuard, roomTypeController.deleteRoomType);

module.exports = router;