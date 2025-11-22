const db = require('../config/db');
const crypto = require('crypto');

const getAllStaff = async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number, is_active FROM Users WHERE is_staff = TRUE ORDER BY user_id ASC');
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
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, password, and email are required.' });
        }
        
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const query = `
            INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, is_staff)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING user_id, username;
        `;
        const result = await db.query(query, [username, passwordHash, email, first_name, last_name, phone_number]);
        res.status(201).json({ message: 'Staff created', staff: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Username or Email already exists.' });
        res.status(500).json({ error: err.message });
    }
};

// --- FIX QUAN TRỌNG: DÙNG DỮ LIỆU CŨ NẾU DỮ LIỆU MỚI BỊ THIẾU (NOT NULL) ---
const updateStaff = async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    
    try {
        // 1. Lấy dữ liệu cũ
        const existingStaffResult = await db.query('SELECT email, first_name, last_name, phone_number, is_active FROM Users WHERE user_id = $1 AND is_staff = TRUE', [id]);
        if (existingStaffResult.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });
        
        const existingStaff = existingStaffResult.rows[0];

        // 2. Sử dụng dữ liệu mới (nếu có) hoặc dữ liệu cũ (nếu thiếu)
        const email = body.email !== undefined ? body.email : existingStaff.email;
        const first_name = body.first_name !== undefined ? body.first_name : existingStaff.first_name;
        const last_name = body.last_name !== undefined ? body.last_name : existingStaff.last_name;
        const phone_number = body.phone_number !== undefined ? body.phone_number : existingStaff.phone_number;
        const is_active = body.is_active !== undefined ? body.is_active : existingStaff.is_active;

        // 3. Kiểm tra Not Null sau khi gán (đảm bảo email không bị gán thành NULL)
        if (email === null || email === undefined) {
             return res.status(400).json({ error: 'Email cannot be set to null.' });
        }

        // 4. Thực hiện UPDATE với tất cả các trường đã được đảm bảo giá trị
        const result = await db.query(
            'UPDATE Users SET email = $1, first_name = $2, last_name = $3, phone_number = $4, is_active = $5 WHERE user_id = $6 AND is_staff = TRUE RETURNING *',
            [email, first_name, last_name, phone_number, is_active, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Email or Username already exists.' });
        res.status(500).json({ error: err.message });
    }
};

const deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        // Thay DELETE bằng SOFT DELETE (UPDATE is_active = FALSE)
        const result = await db.query('UPDATE Users SET is_active = FALSE WHERE user_id = $1 AND is_staff = TRUE RETURNING user_id', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Staff not found' });
        res.json({ message: 'Staff deactivated successfully (Soft Delete)' });
    } catch (err) {
        if (err.code === '23503') {
             return res.status(400).json({ error: 'Cannot delete: User has related records. Account set to inactive.' });
        }
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllStaff, getStaffById, createStaff, updateStaff, deleteStaff };