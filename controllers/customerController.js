const db = require('../config/db');
const crypto = require('crypto');

const getAllCustomers = async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number, address, date_of_birth, is_active FROM Users WHERE is_staff = FALSE');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const getCustomerByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM Users WHERE user_id = $1 AND is_staff = FALSE', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        
        // Phân quyền: Chỉ admin hoặc chính customer đó mới xem được chi tiết
        if (!req.user.is_staff && req.user.user_id !== parseInt(id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCustomer = async (req, res) => {
    const { username, password, email, first_name, last_name, phone_number, address, date_of_birth, gender } = req.body;
    try {
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const query = `
            INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, address, date_of_birth, gender, is_staff)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE) RETURNING user_id, username;
        `;
        const result = await db.query(query, [username, passwordHash, email, first_name, last_name, phone_number, address, date_of_birth, gender]);
        res.status(201).json({ message: 'Customer created', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { email, first_name, last_name, phone_number, address, date_of_birth, is_active } = req.body;
    
    if (!req.user.is_staff && req.user.user_id !== parseInt(id)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const result = await db.query(
            'UPDATE Users SET email = $1, first_name = $2, last_name = $3, phone_number = $4, address = $5, date_of_birth = $6, is_active = $7 WHERE user_id = $8 AND is_staff = FALSE RETURNING *',
            [email, first_name, last_name, phone_number, address, date_of_birth, is_active !== undefined ? is_active : true, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Users WHERE user_id = $1 AND is_staff = FALSE RETURNING user_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };