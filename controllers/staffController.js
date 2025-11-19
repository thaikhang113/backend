const db = require('../config/db');
const crypto = require('crypto'); // Dùng module có sẵn của Node.js để hash

const getAllStaff = async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number FROM Users WHERE is_staff = TRUE');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createStaff = async (req, res) => {
    const { username, password, email, first_name, last_name, phone_number } = req.body;
    try {
        // Simple hash (Thực tế nên dùng bcrypt)
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

module.exports = { getAllStaff, createStaff };