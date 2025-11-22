const db = require('../config/db');
const crypto = require('crypto');

const CustomerController = {
    getAllCustomers: async (req, res) => {
        try {
            // Chỉ lấy khách hàng chưa bị xóa (is_active = true hoặc null)
            const result = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number, address, date_of_birth, is_active FROM Users WHERE is_staff = FALSE ORDER BY user_id DESC');
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getCustomerById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM Users WHERE user_id = $1 AND is_staff = FALSE', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
            
            // Check quyền: Admin hoặc chính chủ
            if (req.user && !req.user.is_staff && req.user.user_id !== parseInt(id)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createCustomer: async (req, res) => {
        const { username, password, email, first_name, last_name, phone_number, address, date_of_birth, gender } = req.body;
        try {
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
            const query = `
                INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, address, date_of_birth, gender, is_staff, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, TRUE) RETURNING user_id, username;
            `;
            const result = await db.query(query, [username, passwordHash, email, first_name, last_name, phone_number, address, date_of_birth, gender]);
            res.status(201).json({ message: 'Customer created', user: result.rows[0] });
        } catch (err) {
            if (err.code === '23505') return res.status(400).json({ message: 'Username hoặc Email đã tồn tại' });
            res.status(500).json({ error: err.message });
        }
    },

    updateCustomer: async (req, res) => {
        const { id } = req.params;
        const { email, first_name, last_name, phone_number, address, date_of_birth, is_active } = req.body;
        
        if (req.user && !req.user.is_staff && req.user.user_id !== parseInt(id)) {
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
    },

    // --- FIX QUAN TRỌNG: SOFT DELETE ---
    deleteCustomer: async (req, res) => {
        const { id } = req.params;
        try {
            // Thay vì DELETE, ta dùng UPDATE is_active = false
            const result = await db.query('UPDATE Users SET is_active = FALSE WHERE user_id = $1 AND is_staff = FALSE RETURNING user_id', [id]);
            
            if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
            res.json({ message: 'Đã khóa tài khoản khách hàng thành công (Soft Delete)' });
        } catch (err) {
            // Nếu vẫn muốn xóa cứng và gặp lỗi ràng buộc
            if (err.code === '23503') {
                return res.status(400).json({ message: 'Không thể xóa khách hàng này vì họ đã có dữ liệu Booking. Hệ thống đã tự động chuyển sang khóa tài khoản.' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = CustomerController;