const db = require('../config/db');
const { sendEmail } = require('../utils/email');

const createBooking = async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN'); 
        const { user_id, check_in, check_out, total_guests, room_ids } = req.body;

        const bookingQuery = `
            INSERT INTO Bookings (user_id, check_in, check_out, status, total_guests)
            VALUES ($1, $2, $3, 'confirmed', $4)
            RETURNING booking_id
        `;
        const bookingRes = await client.query(bookingQuery, [user_id, check_in, check_out, total_guests]);
        const bookingId = bookingRes.rows[0].booking_id;

        for (const roomId of room_ids) {
            const priceRes = await client.query('SELECT price_per_night FROM Rooms WHERE room_id = $1', [roomId]);
            if (priceRes.rows.length === 0) throw new Error(`Room ID ${roomId} not found`);
            const price = priceRes.rows[0].price_per_night;
            await client.query(
                'INSERT INTO Booked_Rooms (booking_id, room_id, price_at_booking) VALUES ($1, $2, $3)',
                [bookingId, roomId, price]
            );
        }

        await client.query('COMMIT');

        const userRes = await db.query('SELECT email FROM Users WHERE user_id = $1', [user_id]);
        if (userRes.rows.length > 0) {
            sendEmail(userRes.rows[0].email, 'Booking Confirmed', `Your booking ID is ${bookingId}`);
        }

        res.status(201).json({ message: 'Booking created successfully', bookingId });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

const getBookings = async (req, res) => {
    try {
        let query = `
            SELECT b.*, u.username 
            FROM Bookings b
            JOIN Users u ON b.user_id = u.user_id
        `;
        // Phân quyền: Customer chỉ thấy booking của mình
        if (!req.user.is_staff) {
            query += ` WHERE b.user_id = ${req.user.user_id}`;
        }
        query += ` ORDER BY b.booking_date DESC`;
        
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getBookingById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Bookings WHERE booking_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
        
        if (!req.user.is_staff && result.rows[0].user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { status, check_in, check_out } = req.body;
    try {
        const booking = await db.query('SELECT * FROM Bookings WHERE booking_id = $1', [id]);
        if (booking.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });

        if (!req.user.is_staff && booking.rows[0].user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const result = await db.query(
            'UPDATE Bookings SET status = $1, check_in = $2, check_out = $3 WHERE booking_id = $4 RETURNING *',
            [status, check_in, check_out, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        // Xóa liên quan cascade trong DB (nếu cấu hình) hoặc xóa tay
        // Ở đây giả định CASCADE trong DB, nếu chưa có cần thêm ALTER TABLE
        // Trong SQL trên: ON DELETE CASCADE chưa được set cho FK bookings.
        // Sẽ xóa bảng con trước.
        await db.query('DELETE FROM Booked_Rooms WHERE booking_id = $1', [id]);
        await db.query('DELETE FROM Used_Services WHERE booking_id = $1', [id]);
        await db.query('DELETE FROM Invoices WHERE booking_id = $1', [id]);
        await db.query('DELETE FROM Reviews WHERE booking_id = $1', [id]);
        
        const result = await db.query('DELETE FROM Bookings WHERE booking_id = $1 RETURNING booking_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createBooking, getBookings, getBookingById, updateBooking, deleteBooking };