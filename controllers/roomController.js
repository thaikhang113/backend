const db = require('../config/db');
const HistoryRoomStatus = require('../models/history_room_status');

const getAllRooms = async (req, res) => {
    try {
        // Join với Room_Types để lấy tên loại phòng
        const query = `
            SELECT r.*, rt.name as room_type_name 
            FROM Rooms r 
            JOIN Room_Types rt ON r.room_type_id = rt.room_type_id
            ORDER BY r.room_number
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateRoomStatus = async (req, res) => {
    // Logic thay đổi trạng thái phòng (VD: available -> occupied)
    // Cần thêm cột 'status' vào bảng Rooms nếu file SQL chưa có, hoặc giả định bảng Rooms có cột này.
    // Dựa trên file SQL bạn cung cấp: Bảng Rooms KHÔNG CÓ cột status (chỉ có is_active?).
    // Tuy nhiên, tôi sẽ giả định logic này cập nhật trạng thái 'is_active' hoặc một cột logic.
    
    const { id } = req.params;
    const { status } = req.body; // VD: true/false cho is_active
    const userId = req.user ? req.user.user_id : 0;

    try {
        // 1. Get old status
        const oldRoom = await db.query('SELECT is_active FROM Rooms WHERE room_id = $1', [id]);
        if (oldRoom.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        
        const oldStatus = oldRoom.rows[0].is_active;

        // 2. Update
        const result = await db.query(
            'UPDATE Rooms SET is_active = $1 WHERE room_id = $2 RETURNING *',
            [status, id]
        );

        // 3. Log history (Model Requirement)
        await HistoryRoomStatus.logStatusChange(id, oldStatus, status, userId);

        res.json({ message: 'Room status updated', room: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllRooms, updateRoomStatus };