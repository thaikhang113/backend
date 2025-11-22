const db = require('../config/db');

const PromotionController = {
    // 1. Lấy tất cả khuyến mãi (Chỉ lấy cái đang active nếu cần)
    getAllPromotions: async (req, res) => {
        try {
            // Lấy tất cả để quản lý, sắp xếp cái mới nhất lên đầu
            const result = await db.query('SELECT * FROM Promotions ORDER BY created_at DESC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. Lấy chi tiết
    getPromotionById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM Promotions WHERE promotion_id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Promotion not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. Tạo mới (SỬA LỖI TRÙNG MÃ - DUPLICATE KEY)
    createPromotion: async (req, res) => {
        try {
            const { promotion_code, name, discount_value, start_date, end_date, usage_limit, scope, description } = req.body;
            
            const result = await db.query(
                `INSERT INTO Promotions 
                (promotion_code, name, discount_value, start_date, end_date, usage_limit, scope, description, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE) 
                RETURNING *`,
                [promotion_code, name, discount_value, start_date, end_date, usage_limit || 100, scope || 'invoice', description]
            );
            
            res.status(201).json({ message: 'Tạo mã giảm giá thành công', promotion: result.rows[0] });
        } catch (error) {
            // Bắt lỗi trùng mã (Code 23505)
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Lỗi: Mã giảm giá này đã tồn tại!' });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // 4. Cập nhật
    updatePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, discount_value, start_date, end_date, usage_limit, is_active } = req.body;
            
            const result = await db.query(
                `UPDATE Promotions 
                 SET name = $1, discount_value = $2, start_date = $3, end_date = $4, usage_limit = $5, is_active = $6
                 WHERE promotion_id = $7 RETURNING *`,
                [name, discount_value, start_date, end_date, usage_limit, is_active, id]
            );

            if (result.rows.length === 0) return res.status(404).json({ message: 'Promotion not found' });
            res.json({ message: 'Cập nhật thành công', promotion: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 5. Xóa (SỬA LỖI FOREIGN KEY - Thay vì xóa hẳn, ta chỉ ẩn đi)
    deletePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Thay vì DELETE FROM..., ta dùng UPDATE is_active = false (Soft Delete)
            // Để tránh lỗi Reference Key từ bảng Invoices
            const result = await db.query(
                'UPDATE Promotions SET is_active = FALSE WHERE promotion_id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
            }

            res.json({ message: 'Đã xóa (ẩn) mã giảm giá thành công' });
        } catch (error) {
            // Nếu vẫn cố xóa cứng và gặp lỗi
            if (error.code === '23503') {
                return res.status(400).json({ message: 'Không thể xóa: Mã này đã được sử dụng trong hóa đơn. Hệ thống đã chuyển sang chế độ ẩn.' });
            }
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = PromotionController;