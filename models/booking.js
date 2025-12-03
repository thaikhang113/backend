const db = require('../config/db');

const Booking = {
    create: async (data, client = db) => {
        const { user_id, check_in, check_out, total_guests } = data;
        const res = await client.query(
            'INSERT INTO Bookings (user_id, check_in, check_out, total_guests, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, check_in, check_out, total_guests, 'pending']
        );
        return res.rows[0];
    },

    addRoom: async (bookingId, roomId, price, client = db) => {
        await client.query(
            'INSERT INTO Booked_Rooms (booking_id, room_id, price_at_booking) VALUES ($1, $2, $3)',
            [bookingId, roomId, price]
        );
    },

    getById: async (id, client = db) => {
        const res = await client.query(`
            SELECT b.*, u.username, u.email 
            FROM Bookings b
            JOIN Users u ON b.user_id = u.user_id
            WHERE b.booking_id = $1
        `, [id]);
        return res.rows[0];
    },

    getBookedRooms: async (bookingId, client = db) => {
        const res = await client.query(`
            SELECT r.*, br.price_at_booking
            FROM Booked_Rooms br
            JOIN Rooms r ON br.room_id = r.room_id
            WHERE br.booking_id = $1
        `, [bookingId]);
        return res.rows;
    },

    updateStatus: async (id, status, client = db) => {
        const res = await client.query('UPDATE Bookings SET status = $1 WHERE booking_id = $2 RETURNING *', [status, id]);
        return res.rows[0];
    }
};

module.exports = Booking;