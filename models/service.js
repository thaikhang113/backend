const db = require('../config/db');

const Service = {
    getAll: async () => {
        const res = await db.query('SELECT * FROM Services WHERE availability = TRUE');
        return res.rows;
    },

    addUsedService: async (data) => {
        const { booking_id, service_id, quantity, price } = data;
        const res = await db.query(
            'INSERT INTO Used_Services (booking_id, service_id, quantity, service_price, service_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [booking_id, service_id, quantity, price]
        );
        return res.rows[0];
    },

    getUsedByBooking: async (bookingId) => {
        const res = await db.query(`
            SELECT us.*, s.name 
            FROM Used_Services us
            JOIN Services s ON us.service_id = s.service_id
            WHERE us.booking_id = $1
        `, [bookingId]);
        return res.rows;
    }
};

module.exports = Service;