const db = require('../config/db');
const crypto = require('crypto');

const getAllStaff = async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number, is_active FROM Users WHERE is_staff = TRUE');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number, is_active FROM Users WHERE user_id = $1 AND is_staff = TRUE', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createStaff = async (req, res) => {
    const { username, password, email, first_name, last_name, phone_number } = req.body;
    try {
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const query = `
            INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, is_staff)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING user_id, username;
        `;
        const result = await db.query(query, [username, passwordHash, email, first_name, last_name, phone_number]);
        res.status(201).json({ message: 'Staff created', staff: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateStaff = async (req, res) => {
    const { id } = req.params;
    const { email, first_name, last_name, phone_number, is_active } = req.body;
    try {
        const result = await db.query(
            'UPDATE Users SET email = $1, first_name = $2, last_name = $3, phone_number = $4, is_active = $5 WHERE user_id = $6 AND is_staff = TRUE RETURNING *',
            [email, first_name, last_name, phone_number, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Users WHERE user_id = $1 AND is_staff = TRUE RETURNING user_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });
        res.json({ message: 'Staff deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllStaff, getStaffById, createStaff, updateStaff, deleteStaff };