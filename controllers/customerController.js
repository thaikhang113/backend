const db = require('../config/db');

const getAllCustomers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Users WHERE is_staff = FALSE');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM Users WHERE user_id = $1 AND is_staff = FALSE', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllCustomers, getCustomerById };