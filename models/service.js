const db = require('../config/db');

const Service = {
    getAll: async (client = db) => {
        const res = await client.query('SELECT * FROM Services WHERE availability = TRUE');
        return res.rows;
    },

    addUsedService: async (data, client = db) => {
        const { booking_id, service_id, quantity, price, room_id } = data;
        const res = await client.query(
            'INSERT INTO Used_Services (booking_id, service_id, quantity, service_price, service_date, room_id) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING *',
            [booking_id, service_id, quantity, price, room_id || null]
        );
        return res.rows[0];
    },

    getUsedByBooking: async (bookingId, client = db) => {
        const res = await client.query(`
            SELECT us.*, s.name, r.room_number 
            FROM Used_Services us
            JOIN Services s ON us.service_id = s.service_id
            LEFT JOIN Rooms r ON us.room_id = r.room_id
            WHERE us.booking_id = $1
        `, [bookingId]);
        return res.rows;
    }
};

module.exports = Service;