const { Pool } = require('pg');
require('dotenv').config();

// Khởi tạo kết nối
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // BẮT BUỘC với Azure (để bỏ qua lỗi chứng chỉ tự ký)
    }
});

// Lắng nghe lỗi bất ngờ
pool.on('error', (err, client) => {
    console.error('Lỗi từ Pool kết nối:', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};