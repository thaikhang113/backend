const db = require('../config/db');
const BookingService = require('../services/bookingService');

const RoomController = {
    getAllRooms: async (req, res) => {
        try {
            const result = await db.query(`
                SELECT r.*, rt.name as room_type_name 
                FROM Rooms r 
                JOIN Room_Types rt ON r.room_type_id = rt.room_type_id 
                WHERE r.is_active = TRUE 
                ORDER BY r.room_number ASC
            `);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getRoomById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM Rooms WHERE room_id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    searchAvailableRooms: async (req, res) => {
        try {
            const { checkIn, checkOut, roomTypeId } = req.query;
            if (!checkIn || !checkOut) {
                return res.status(400).json({ message: 'Check-in and Check-out dates are required.' });
            }

            let query = `
                SELECT r.*, rt.name as room_type_name, r.price_per_night as base_price
                FROM Rooms r
                JOIN Room_Types rt ON r.room_type_id = rt.room_type_id
                WHERE r.status = 'available'
                AND r.is_active = TRUE
                AND r.room_id NOT IN (
                    SELECT br.room_id 
                    FROM Booked_Rooms br
                    JOIN Bookings b ON br.booking_id = b.booking_id
                    WHERE b.status NOT IN ('cancelled', 'rejected')
                    AND (
                        (b.check_in <= $1 AND b.check_out >= $1) OR
                        (b.check_in <= $2 AND b.check_out >= $2) OR
                        ($1 <= b.check_in AND $2 >= b.check_out)
                    )
                )
            `;
            
            const params = [checkIn, checkOut];
            if (roomTypeId) {
                query += ` AND r.room_type_id = $3`;
                params.push(roomTypeId);
            }

            const result = await db.query(query, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createRoom: async (req, res) => {
        const { room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description } = req.body;
        
        if (!room_number || !room_type_id || !price_per_night) {
             return res.status(400).json({ message: 'Room number, type ID, and price are required.' });
        }

        try {
            const result = await db.query(
                `INSERT INTO Rooms 
                (room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'available', TRUE) 
                RETURNING *`,
                [room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description]
            );
            res.status(201).json({ message: 'Room created', room: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'Room number already exists.' });
            res.status(500).json({ error: error.message });
        }
    },

    updateRoom: async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        try {
            const existingResult = await db.query('SELECT * FROM Rooms WHERE room_id = $1', [id]);
            if (existingResult.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
            const existing = existingResult.rows[0];

            const room_number = body.room_number !== undefined ? body.room_number : existing.room_number;
            const room_type_id = body.room_type_id !== undefined ? body.room_type_id : existing.room_type_id;
            const floor = body.floor !== undefined ? body.floor : existing.floor;
            const price_per_night = body.price_per_night !== undefined ? body.price_per_night : existing.price_per_night;
            const max_guests = body.max_guests !== undefined ? body.max_guests : existing.max_guests;
            const bed_count = body.bed_count !== undefined ? body.bed_count : existing.bed_count;
            const description = body.description !== undefined ? body.description : existing.description;
            const status = body.status !== undefined ? body.status : existing.status;
            const is_active = body.is_active !== undefined ? body.is_active : existing.is_active;

            if (!room_number || !room_type_id || !price_per_night) {
                 return res.status(400).json({ error: 'Room number, type ID, and price cannot be null.' });
            }

            const result = await db.query(
                `UPDATE Rooms SET 
                 room_number = $1, room_type_id = $2, floor = $3, price_per_night = $4, 
                 max_guests = $5, bed_count = $6, description = $7, status = $8, is_active = $9
                 WHERE room_id = $10 RETURNING *`,
                [room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status, is_active, id]
            );

            res.json(result.rows[0]);
        } catch (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'Room number already exists.' });
            res.status(500).json({ error: error.message });
        }
    },

    updateRoomStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const result = await db.query('UPDATE Rooms SET status = $1 WHERE room_id = $2 RETURNING *', [status, req.params.id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteRoom: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query('UPDATE Rooms SET is_active = FALSE WHERE room_id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
            res.json({ message: 'Room deactivated successfully (Soft Delete)' });
        } catch (err) {
            if (err.code === '23503') {
                 return res.status(400).json({ error: 'Cannot delete room: Referenced by active bookings.' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = RoomController;