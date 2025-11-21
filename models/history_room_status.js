const db = require('../config/db');

const logStatusChange = async (roomId, oldStatus, newStatus, changedBy) => {
    try {
        const query = `
            INSERT INTO Room_Status_History (room_id, old_status, new_status, changed_by)
            VALUES ($1, $2, $3, $4)
        `;
        await db.query(query, [roomId, oldStatus, newStatus, changedBy]);
    } catch (err) {
        console.error('Error logging room status:', err);
    }
};

module.exports = { logStatusChange };