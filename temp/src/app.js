// src/app.js
const express = require('express');
const helmet = require('helmet'); // Bảo mật
const cors = require('cors');     // Cho phép gọi chéo trang

// Import Routes
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');

// Import Middleware lỗi
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- 1. MIDDLEWARE NỀN TẢNG ---
app.use(helmet()); 
app.use(cors());
app.use(express.json()); // Đọc JSON từ iOS gửi lên
app.use(express.urlencoded({ extended: true }));

// --- 2. ĐỊNH TUYẾN (ROUTING) ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/home', homeRoutes);

// --- 3. XỬ LÝ LỖI (Phải đặt cuối cùng) ---
// Nếu không route nào khớp, hoặc code bị crash, nó sẽ chạy vào đây
app.use(errorHandler);

module.exports = app;