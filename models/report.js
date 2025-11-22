const db = require('../config/db');

const Report = {
    create: async (data) => {
        const { title, type, start_date, end_date, revenue, content, created_by } = data;
        const res = await db.query(
            'INSERT INTO Reports (title, report_type, start_date, end_date, total_revenue, generated_content, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, type, start_date, end_date, revenue, content, created_by]
        );
        return res.rows[0];
    },

    getRevenueByRange: async (startDate, endDate) => {
        const res = await db.query(`
            SELECT SUM(final_amount) as total_revenue, COUNT(invoice_id) as total_invoices
            FROM Invoices
            WHERE issue_date BETWEEN $1 AND $2 AND payment_status = 'paid'
        `, [startDate, endDate]);
        return res.rows[0];
    },

    getAll: async () => {
        const res = await db.query('SELECT * FROM Reports ORDER BY created_at DESC');
        return res.rows;
    }
};

module.exports = Report;