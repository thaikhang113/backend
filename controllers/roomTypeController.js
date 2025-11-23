const db = require('../config/db');

const RoomTypeController = {
    getAllRoomTypes: async (req, res) => {
        try {
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
            if (!name) return res.status(400).json({ message: 'Room type name is required.' });

            const result = await db.query(
                'INSERT INTO Room_Types (name, description, is_active) VALUES ($1, $2, TRUE) RETURNING *',
                [name, description]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            if (err.code === '23505') return res.status(400).json({ error: 'Room type name already exists.' });
            res.status(500).json({ error: err.message });
        }
    },

    updateRoomType: async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        try {
            const existingResult = await db.query('SELECT name, description, is_active FROM Room_Types WHERE room_type_id = $1', [id]);
            if (existingResult.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
            const existing = existingResult.rows[0];

            const name = body.name !== undefined ? body.name : existing.name;
            const description = body.description !== undefined ? body.description : existing.description;
            const is_active = body.is_active !== undefined ? body.is_active : existing.is_active;

            if (!name) {
                 return res.status(400).json({ error: 'Room type name cannot be null.' });
            }

            const result = await db.query(
                'UPDATE Room_Types SET name = $1, description = $2, is_active = $3 WHERE room_type_id = $4 RETURNING *',
                [name, description, is_active, id]
            );

            res.json(result.rows[0]);
        } catch (err) {
            if (err.code === '23505') return res.status(400).json({ error: 'Room type name already exists.' });
            res.status(500).json({ error: err.message });
        }
    },

    deleteRoomType: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query('UPDATE Room_Types SET is_active = FALSE WHERE room_type_id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) return res.status(404).json({ message: 'Room Type not found' });
            res.json({ message: 'Room Type deactivated successfully (Soft Delete)' });
        } catch (err) {
            if (err.code === '23503') {
                 return res.status(400).json({ error: 'Cannot delete: Rooms are using this type. Type set to inactive.' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = RoomTypeController;