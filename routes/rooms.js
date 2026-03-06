const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', authMiddleware, roomController.createRoom);
router.put('/:id', authMiddleware, roomController.updateRoom);
router.put('/:id/status', authMiddleware, roomController.updateRoomStatus); // Staff can update status
router.delete('/:id', authMiddleware, roomController.deleteRoom);

module.exports = router;