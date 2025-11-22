const db = require('../config/db');

const RoomTypeController = {
    getAllRoomTypes: async (req, res) => {
        try {
            // Chỉ lấy loại phòng đang hoạt động
            const result = await db.query('SELECT * FROM Room_Types WHERE is_active = TRUE ORDER BY room_type_id ASC');
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getRoomTypeById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM Room_Types WHERE room_type_id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createRoomType: async (req, res) => {
        const { name, description } = req.body;
        try {
            const result = await db.query(
                'INSERT INTO Room_Types (name, description, is_active) VALUES ($1, $2, TRUE) RETURNING *',
                [name, description]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            if (err.code === '23505') return res.status(400).json({ message: 'Tên loại phòng đã tồn tại' });
            res.status(500).json({ error: err.message });
        }
    },

    updateRoomType: async (req, res) => {
        const { id } = req.params;
        const { name, description, is_active } = req.body;
        try {
            const result = await db.query(
                'UPDATE Room_Types SET name = $1, description = $2, is_active = $3 WHERE room_type_id = $4 RETURNING *',
                [name, description, is_active !== undefined ? is_active : true, id]
            );
            if (result.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // --- FIX QUAN TRỌNG: SOFT DELETE CHO ROOM TYPE ---
    deleteRoomType: async (req, res) => {
        const { id } = req.params;
        try {
            // Thử Soft Delete
            const result = await db.query('UPDATE Room_Types SET is_active = FALSE WHERE room_type_id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
            res.json({ message: 'Đã ẩn loại phòng thành công (Soft Delete)' });
        } catch (err) {
            if (err.code === '23503') {
                return res.status(400).json({ message: 'Không thể xóa loại phòng này vì đang có phòng sử dụng nó.' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = RoomTypeController;