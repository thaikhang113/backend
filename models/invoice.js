const db = require('../config/db');

const Invoice = {
    create: async (data, client = db) => {
        const { booking_id, staff_id, total_room, total_service, discount, final_total, promo_id } = data;
        const res = await client.query(
            `INSERT INTO Invoices (booking_id, staff_id, total_room_cost, total_service_cost, discount_amount, final_amount, promotion_id, payment_status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'unpaid') RETURNING *`,
            [booking_id, staff_id, total_room, total_service, discount, final_total, promo_id]
        );
        return res.rows[0];
    },

    getAll: async () => {
        const res = await db.query(`
            SELECT i.*, u.username as staff_name, b.user_id as customer_id
            FROM Invoices i
            LEFT JOIN Users u ON i.staff_id = u.user_id
            JOIN Bookings b ON i.booking_id = b.booking_id
            ORDER BY i.issue_date DESC
        `);
        return res.rows;
    },

    getById: async (id) => {
        const res = await db.query('SELECT * FROM Invoices WHERE invoice_id = $1', [id]);
        return res.rows[0];
    },

    updatePaymentStatus: async (id, status, method) => {
        const res = await db.query(
            'UPDATE Invoices SET payment_status = $1, payment_method = $2 WHERE invoice_id = $3 RETURNING *',
            [status, method, id]
        );
        return res.rows[0];
    }
};

module.exports = Invoice;