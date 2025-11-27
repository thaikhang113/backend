const db = require('../config/db');

const getAllCustomers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Users WHERE is_staff = FALSE ORDER BY user_id DESC');
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

        // Đã xóa check quyền: Ai cũng có thể xem chi tiết
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCustomer = async (req, res) => {
    const { username, password, email, first_name, last_name, phone_number, address, date_of_birth, gender } = req.body;
    try {
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, password, and email are required.' });
        }

        // Không hash password
        const passwordHash = password;

        const query = `
            INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, address, date_of_birth, gender, is_staff, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, TRUE) RETURNING user_id, username;
        `;
        const result = await db.query(query, [username, passwordHash, email, first_name, last_name, phone_number, address, date_of_birth, gender]);
        res.status(201).json({ message: 'Customer created', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Username or Email already exists.' });
        res.status(500).json({ error: err.message });
    }
};

const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    // Đã xóa check quyền: Ai cũng có thể sửa

    try {
        const existingCustomerResult = await db.query(
            'SELECT email, first_name, last_name, phone_number, address, date_of_birth, is_active FROM Users WHERE user_id = $1 AND is_staff = FALSE', [id]
        );
        if (existingCustomerResult.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });

        const existingCustomer = existingCustomerResult.rows[0];

        const email = body.email !== undefined ? body.email : existingCustomer.email;
        const first_name = body.first_name !== undefined ? body.first_name : existingCustomer.first_name;
        const last_name = body.last_name !== undefined ? body.last_name : existingCustomer.last_name;
const phone_number = body.phone_number !== undefined ? body.phone_number : existingCustomer.phone_number;
        const address = body.address !== undefined ? body.address : existingCustomer.address;
const date_of_birth = body.date_of_birth !== undefined ? body.date_of_birth : existingCustomer.date_of_birth;
        const is_active = body.is_active !== undefined ? body.is_active : existingCustomer.is_active;

        if (email === null || email === undefined) {
             return res.status(400).json({ error: 'Email cannot be null or empty.' });
        }

        const result = await db.query(
            'UPDATE Users SET email = $1, first_name = $2, last_name = $3, phone_number = $4, address = $5, date_of_birth = $6, is_active = $7 WHERE user_id = $8 AND is_staff = FALSE RETURNING *',
            [email, first_name, last_name, phone_number, address, date_of_birth, is_active, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Email or Username already exists.' });
        res.status(500).json({ error: err.message });
    }
};

const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE From Users where user_id = $1 returning user_id', [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deactivated successfully (Soft Delete)' });
    } catch (err) {
        if (err.code === '23503') {
             return res.status(400).json({ error: 'Cannot delete: Customer has related records. Account set to inactive.' });
        }
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };