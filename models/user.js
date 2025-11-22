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
        const res = await db.query(
            'INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, is_staff) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [username, password_hash, email, first_name, last_name, phone_number, is_staff || false]
        );
        return res.rows[0];
    },

    updateOTP: async (username, otp, expiresAt) => {
        await db.query('UPDATE Users SET otp_code = $1, otp_expires_at = $2 WHERE username = $3', [otp, expiresAt, username]);
    },

    verifyOTP: async (username, otp) => {
        const res = await db.query("SELECT * FROM Users WHERE username = $1 AND otp_code = $2 AND otp_expires_at > NOW()", [username, otp]);
        return res.rows[0];
    },

    getAllStaff: async () => {
        const res = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number FROM Users WHERE is_staff = TRUE');
        return res.rows;
    },

    getAllCustomers: async () => {
        const res = await db.query('SELECT user_id, username, email, first_name, last_name, phone_number FROM Users WHERE is_staff = FALSE');
        return res.rows;
    }
};

module.exports = User;