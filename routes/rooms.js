const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware, adminGuard } = require('../middleware/auth');

// router.get('/', roomController.getAllRooms);
// router.get('/:id', roomController.getRoomById);
// router.post('/', authMiddleware, adminGuard, roomController.createRoom);
// router.put('/:id', authMiddleware, adminGuard, roomController.updateRoom);
// router.put('/:id/status', authMiddleware, roomController.updateRoomStatus); // Staff can update status
// router.delete('/:id', authMiddleware, adminGuard, roomController.deleteRoom);

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.put('/:id/status', roomController.updateRoomStatus); // Staff can update status
router.delete('/:id', roomController.deleteRoom);

module.exports = router;