const db = require('../config/db');
const HistoryRoomStatus = require('../models/history_room_status');

const getAllRooms = async (req, res) => {
    try {
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

const getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Rooms WHERE room_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createRoom = async (req, res) => {
    const { room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status, is_active } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Rooms (room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status || 'available', is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status, is_active } = req.body;
    try {
        const result = await db.query(
            'UPDATE Rooms SET room_number=$1, room_type_id=$2, floor=$3, price_per_night=$4, max_guests=$5, bed_count=$6, description=$7, status=$8, is_active=$9 WHERE room_id=$10 RETURNING *',
            [room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateRoomStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    const userId = req.user ? req.user.user_id : 0;

    try {
        const oldRoom = await db.query('SELECT status FROM Rooms WHERE room_id = $1', [id]);
        if (oldRoom.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        
        const oldStatus = oldRoom.rows[0].status;

        const result = await db.query(
            'UPDATE Rooms SET status = $1 WHERE room_id = $2 RETURNING *',
            [status, id]
        );

        await HistoryRoomStatus.logStatusChange(id, oldStatus, status, userId);

        res.json({ message: 'Room status updated', room: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Rooms WHERE room_id = $1 RETURNING room_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, updateRoomStatus, deleteRoom };