// server.js
require('dotenv').config();
const app = require('./src/app'); // Import cái app đã cấu hình ở trên
const db = require('./src/config/database'); // Kết nối DB

const PORT = process.env.PORT || 3000;

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server Homestay đang chạy tại http://localhost:${PORT}`);
    console.log(`📡 Sẵn sàng nhận kết nối từ iOS...`);
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM companies'); 
        
        res.json({
            message: "Đọc dữ liệu thành công!",
            so_luong: result.rows.length,
            du_lieu: result.rows 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Lỗi đọc dữ liệu", 
            loi_chi_tiet: error.message 
        });
    }
}); 