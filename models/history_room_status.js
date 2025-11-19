const db = require('../config/db');

class HistoryRoomStatus {
    static async logStatusChange(roomId, oldStatus, newStatus, changedBy) {
        try {
            const query = `
                INSERT INTO Room_Status_History (room_id, old_status, new_status, changed_at, changed_by)
                VALUES ($1, $2, $3, NOW(), $4)
            `;
            // Bây giờ đã an toàn để chạy query này sau khi chạy file fix_schema.sql
            await db.query(query, [roomId, oldStatus, newStatus, changedBy]);
            console.log(`[AUDIT] Room ${roomId} changed from ${oldStatus} to ${newStatus} by User ${changedBy}`);
            return true;
        } catch (error) {
            console.error('[AUDIT ERROR] Could not log room status change:', error.message);
            // Không throw error để tránh làm fail luồng chính của user
            return false;
        }
    }
}

module.exports = HistoryRoomStatus;