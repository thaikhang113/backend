const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', roomTypeController.getAllRoomTypes);
router.get('/:id', roomTypeController.getRoomTypeById);
router.post('/', authMiddleware, roomTypeController.createRoomType);
router.put('/:id', authMiddleware, roomTypeController.updateRoomType);
router.delete('/:id', authMiddleware, roomTypeController.deleteRoomType);

module.exports = router;