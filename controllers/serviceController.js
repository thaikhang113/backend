const db = require('../config/db');

const getAllServices = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Services');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createService = async (req, res) => {
    const { name, price, is_active, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Services (name, price, is_active, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, is_active || true, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllServices, createService };