const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', roomController.getAllRooms);
router.put('/:id/status', authMiddleware, roomController.updateRoomStatus);

module.exports = router;