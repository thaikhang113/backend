const Room = require('../models/room');
const BookingService = require('../services/bookingService');

const RoomController = {
    getAllRooms: async (req, res) => {
        try {
            const rooms = await Room.getAll();
            res.json(rooms);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getRoomById: async (req, res) => {
        try {
            const room = await Room.getById(req.params.id);
            if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
            res.json(room);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // API Tìm phòng trống (Quan trọng)
    searchAvailableRooms: async (req, res) => {
        try {
            const { checkIn, checkOut, roomTypeId } = req.query;
            if (!checkIn || !checkOut) {
                return res.status(400).json({ message: 'Vui lòng cung cấp ngày check-in và check-out' });
            }

            let rooms;
            if (roomTypeId) {
                rooms = await BookingService.checkAvailability(roomTypeId, checkIn, checkOut);
            } else {
                rooms = await Room.getAvailable(checkIn, checkOut);
            }
            res.json(rooms);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createRoom: async (req, res) => {
        try {
            const newRoom = await Room.create(req.body);
            res.status(201).json(newRoom);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    updateRoomStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const updatedRoom = await Room.updateStatus(req.params.id, status);
            res.json(updatedRoom);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = RoomController;