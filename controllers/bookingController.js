const BookingService = require('../services/bookingService');
const Booking = require('../models/booking');

const BookingController = {
    createBooking: async (req, res) => {
        try {
            // req.user được lấy từ middleware verifyToken
            const userId = req.user ? req.user.user_id : req.body.user_id; 
            const booking = await BookingService.createBooking(userId, req.body);
            res.status(201).json({ message: 'Đặt phòng thành công', booking });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    addService: async (req, res) => {
        try {
            const { serviceCode, quantity } = req.body;
            const bookingId = req.params.id;
            const result = await BookingService.addServiceToRoom(bookingId, serviceCode, quantity);
            res.json({ message: 'Thêm dịch vụ thành công', result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    checkout: async (req, res) => {
        try {
            const bookingId = req.params.id;
            await BookingService.checkOut(bookingId);
            res.json({ message: 'Check-out thành công. Vui lòng lập hóa đơn.' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getBookingDetails: async (req, res) => {
        try {
            const booking = await Booking.getById(req.params.id);
            const rooms = await Booking.getBookedRooms(req.params.id);
            if (!booking) return res.status(404).json({ message: 'Booking not found' });
            res.json({ ...booking, rooms });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = BookingController;