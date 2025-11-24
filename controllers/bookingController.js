const db = require('../config/db');
const BookingService = require('../services/bookingService');

const BookingController = {
    createBooking: async (req, res) => {
        try {
            // req.user được giả lập từ server.js
            const userId = req.user ? req.user.user_id : req.body.user_id; 
            const booking = await BookingService.createBooking(userId, req.body);
            res.status(201).json({ message: 'Đặt phòng thành công', booking });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getBookingDetails: async (req, res) => {
        try {
            const bookingId = req.params.id;
            // Nếu không có ID (trường hợp get all)
            if (!bookingId || bookingId === 'undefined') {
                 const userId = req.user.user_id;
                 // Mặc định cho phép xem hết nếu là staff (user giả lập là staff)
                 const query = req.user.is_staff 
                    ? `SELECT b.*, u.username FROM Bookings b JOIN Users u ON b.user_id = u.user_id ORDER BY b.booking_date DESC` 
                    : `SELECT * FROM Bookings WHERE user_id = $1 ORDER BY booking_date DESC`;
                 
                 const params = req.user.is_staff ? [] : [userId];
                 const result = await db.query(query, params);
                 return res.json(result.rows);
            }

            const booking = await db.query(`
                SELECT b.*, u.username, u.email 
                FROM Bookings b
                JOIN Users u ON b.user_id = u.user_id
                WHERE b.booking_id = $1
            `, [bookingId]);
            
            if (booking.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });

            const rooms = await db.query(`
                SELECT r.*, br.price_at_booking
                FROM Booked_Rooms br
                JOIN Rooms r ON br.room_id = r.room_id
                WHERE br.booking_id = $1
            `, [bookingId]);

            const services = await db.query(`
                SELECT s.name, us.quantity, us.service_price
                FROM Used_Services us
                JOIN Services s ON us.service_id = s.service_id
                WHERE us.booking_id = $1
            `, [bookingId]);

            res.json({ ...booking.rows[0], rooms: rooms.rows, services: services.rows });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addService: async (req, res) => {
        try {
            

            const { serviceCode, quantity, roomId } = req.body;
            const bookingId = req.params.id;
            const result = await BookingService.addServiceToRoom(bookingId, serviceCode, quantity,roomId);
            res.json({ message: 'Thêm dịch vụ thành công', result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    checkout: async (req, res) => {
        try {
            const bookingId = req.params.id;
            await BookingService.checkOut(bookingId);
            res.json({ message: 'Check-out thành công. Phòng đã chuyển sang trạng thái dọn dẹp.' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    updateBooking: async (req, res) => {
        const { id } = req.params;
        const { check_in, check_out, status, total_guests } = req.body;
        
        try {
            const oldBooking = await db.query('SELECT * FROM Bookings WHERE booking_id = $1', [id]);
            if (oldBooking.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
            const existing = oldBooking.rows[0];

            const newCheckIn = check_in || existing.check_in;
            const newCheckOut = check_out || existing.check_out;
            const newStatus = status || existing.status;
            const newGuests = total_guests || existing.total_guests;

            const result = await db.query(
                'UPDATE Bookings SET check_in = $1, check_out = $2, status = $3, total_guests = $4 WHERE booking_id = $5 RETURNING *',
                [newCheckIn, newCheckOut, newStatus, newGuests, id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteBooking: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM Booked_Rooms WHERE booking_id = $1', [id]);
            await db.query('DELETE FROM Used_Services WHERE booking_id = $1', [id]);
            const result = await db.query('DELETE FROM Bookings WHERE booking_id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
            res.json({ message: 'Booking deleted successfully' });
        } catch (error) {
            if (error.code === '23503') {
                await db.query("UPDATE Bookings SET status = 'cancelled' WHERE booking_id = $1", [id]);
                return res.json({ message: 'Booking has invoice, status changed to Cancelled instead of delete.' });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = BookingController;