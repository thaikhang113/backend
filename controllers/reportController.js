const db = require('../config/db');

const getRevenueReport = async (req, res) => {
    try {
        const query = `
            SELECT 
                EXTRACT(MONTH FROM issue_date) as month,
                EXTRACT(YEAR FROM issue_date) as year,
                SUM(final_amount) as revenue,
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

const getRevenueByDay = async (req, res) => {
    const { date } = req.query; // Format: YYYY-MM-DD
    try {
        const query = `
            SELECT SUM(total_price) as total_revenue
            FROM Bookings
            WHERE (status = 'paid' OR status = 'completed') 
            AND DATE(booking_date) = $1
        `;
        const result = await db.query(query, [date || new Date().toISOString().split('T')[0]]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRevenueByMonth = async (req, res) => {
    const { month, year } = req.query;
    try {
        const query = `
            SELECT SUM(total_price) as total_revenue
            FROM Bookings
            WHERE (status = 'paid' OR status = 'completed')
            AND EXTRACT(MONTH FROM booking_date) = $1
            AND EXTRACT(YEAR FROM booking_date) = $2
        `;
        const result = await db.query(query, [month, year]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRevenueByYear = async (req, res) => {
    const { year } = req.query;
    try {
        const query = `
            SELECT SUM(total_price) as total_revenue
            FROM Bookings
            WHERE (status = 'paid' OR status = 'completed')
            AND EXTRACT(YEAR FROM booking_date) = $1
        `;
        const result = await db.query(query, [year]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRevenueReport, getBookingStats, getRevenueByDay, getRevenueByMonth, getRevenueByYear };