const db = require('../config/db');

const getAllRoomTypes = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Room_Types');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRoomTypeById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Room_Types WHERE room_type_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createRoomType = async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await db.query('INSERT INTO Room_Types (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateRoomType = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const result = await db.query('UPDATE Room_Types SET name=$1, description=$2 WHERE room_type_id=$3 RETURNING *', [name, description, id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteRoomType = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Room_Types WHERE room_type_id = $1 RETURNING room_type_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
        res.json({ message: 'Room Type deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllRoomTypes, getRoomTypeById, createRoomType, updateRoomType, deleteRoomType };