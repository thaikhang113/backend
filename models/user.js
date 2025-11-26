const db = require('../config/db');

const User = {
    findByUsername: async (username) => {
        const res = await db.query('SELECT * FROM Users WHERE username = $1', [username]);
        return res.rows[0];
    },

    findById: async (id) => {
        const res = await db.query('SELECT * FROM Users WHERE user_id = $1', [id]);
        return res.rows[0];
    },

    create: async (userData) => {
        const { username, password_hash, email, first_name, last_name, phone_number, is_staff } = userData;
        // Mật khẩu được lưu trực tiếp, không hash
        const res = await db.query(
            'INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, is_staff) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [username, password_hash, email, first_name, last_name, phone_number, is_staff || false]
        );
        return res.rows[0];
    },

    getAllStaff: async () => {
        // Hàm này đã có password_hash từ trước
        const res = await db.query('SELECT user_id, username, password_hash, email, first_name, last_name, phone_number FROM Users WHERE is_staff = TRUE');
        return res.rows;
    },

    getAllCustomers: async () => {
        // Đã thêm password_hash vào câu query dưới đây
        const res = await db.query('SELECT user_id, username, password_hash, email, first_name, last_name, phone_number FROM Users WHERE is_staff = FALSE');
        return res.rows;
    }
};

module.exports = User;