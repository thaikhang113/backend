const db = require('../config/db');

const getRevenueReport = async (req, res) => {
    try {
        // Thống kê doanh thu theo tháng
        const query = `
            SELECT 
                EXTRACT(MONTH FROM issue_date) as month,
                EXTRACT(YEAR FROM issue_date) as year,
                SUM(total_amount) as revenue,
                COUNT(invoice_id) as total_invoices
            FROM Invoices
            GROUP BY year, month
            ORDER BY year DESC, month DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getBookingStats = async (req, res) => {
    try {
        const query = `
            SELECT status, COUNT(*) as count 
            FROM Bookings 
            GROUP BY status
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRevenueReport, getBookingStats };