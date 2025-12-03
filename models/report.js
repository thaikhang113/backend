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
        // Tính tổng doanh thu từ các hóa đơn ĐÃ THANH TOÁN (paid)
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
    },

    // CẬP NHẬT: Hàm xóa báo cáo
    delete: async (id) => {
        const res = await db.query('DELETE FROM Reports WHERE report_id = $1 RETURNING *', [id]);
        return res.rows[0];
    }
};

module.exports = Report;