const db = require('../config/db');

const BookingRepository = {
    // Kiểm tra phòng có trống trong khoảng thời gian cụ thể không (Chính xác tuyệt đối)
    isRoomAvailable: async (roomId, checkIn, checkOut, client = db) => {
        const query = `
            SELECT COUNT(*) as count
            FROM Booked_Rooms br
            JOIN Bookings b ON br.booking_id = b.booking_id
            WHERE br.room_id = $1
            AND b.status NOT IN ('cancelled', 'rejected', 'completed')
            AND (
                (b.check_in <= $2 AND b.check_out > $2) OR
                (b.check_in < $3 AND b.check_out >= $3) OR
                ($2 <= b.check_in AND $3 >= b.check_out)
            );
        `;
        const res = await client.query(query, [roomId, checkIn, checkOut]);
        return parseInt(res.rows[0].count) === 0;
    },

    // Tìm danh sách phòng trống theo loại phòng và khoảng thời gian
    findAvailableRoomsByType: async (roomTypeId, checkIn, checkOut) => {
        const query = `
            SELECT r.* FROM Rooms r
            WHERE r.room_type_id = $1 
            AND r.status = 'available'
            AND r.is_active = TRUE
            AND r.room_id NOT IN (
                SELECT br.room_id 
                FROM Booked_Rooms br
                JOIN Bookings b ON br.booking_id = b.booking_id
                WHERE b.status NOT IN ('cancelled', 'rejected', 'completed')
                AND (
                    (b.check_in <= $2 AND b.check_out > $2) OR -- Check-in overlaps
                    (b.check_in < $3 AND b.check_out >= $3) OR -- Check-out overlaps
                    ($2 <= b.check_in AND $3 >= b.check_out)   -- Booking inside range
                )
            );
        `;
        const res = await db.query(query, [roomTypeId, checkIn, checkOut]);
        return res.rows;
    },

    // Lấy lịch sử đặt phòng của khách hàng (kèm review nếu có)
    getCustomerHistory: async (userId) => {
        const query = `
            SELECT 
                b.booking_id, b.check_in, b.check_out, b.total_guests, b.status,
                STRING_AGG(r.room_number, ', ') as rooms,
                i.final_amount,
                rv.rating, rv.comment
            FROM Bookings b
            LEFT JOIN Booked_Rooms br ON b.booking_id = br.booking_id
            LEFT JOIN Rooms r ON br.room_id = r.room_id
            LEFT JOIN Invoices i ON b.booking_id = i.booking_id
            LEFT JOIN Reviews rv ON b.booking_id = rv.booking_id
            WHERE b.user_id = $1
            GROUP BY b.booking_id, i.final_amount, rv.rating, rv.comment
            ORDER BY b.booking_date DESC;
        `;
        const res = await db.query(query, [userId]);
        return res.rows;
    }
};

module.exports = BookingRepository;