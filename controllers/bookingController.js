const db = require('../config/db');
const { sendEmail } = require('../utils/email');

const createBooking = async (req, res) => {
    // 1. Lấy một client riêng từ pool
    const client = await db.pool.connect();
    
    try {
        // 2. Bắt đầu Transaction trên client này
        await client.query('BEGIN'); 

        const { user_id, check_in, check_out, total_guests, room_ids } = req.body;

        // Tạo Booking
        const bookingQuery = `
            INSERT INTO Bookings (user_id, check_in, check_out, status, total_guests)
            VALUES ($1, $2, $3, 'confirmed', $4)
            RETURNING booking_id
        `;
        // LƯU Ý: Dùng client.query chứ không phải db.query
        const bookingRes = await client.query(bookingQuery, [user_id, check_in, check_out, total_guests]);
        const bookingId = bookingRes.rows[0].booking_id;

        // Thêm Rooms vào Booked_Rooms
        for (const roomId of room_ids) {
            // Lấy giá phòng hiện tại
            const priceRes = await client.query('SELECT price_per_night FROM Rooms WHERE room_id = $1', [roomId]);
            
            if (priceRes.rows.length === 0) {
                throw new Error(`Room ID ${roomId} not found`);
            }
            
            const price = priceRes.rows[0].price_per_night;
            
            await client.query(
                'INSERT INTO Booked_Rooms (booking_id, room_id, price_at_booking) VALUES ($1, $2, $3)',
                [bookingId, roomId, price]
            );
        }

        // 3. Commit Transaction (Lưu thay đổi)
        await client.query('COMMIT');

        // Gửi email (làm ngoài transaction để không block)
        const userRes = await db.query('SELECT email FROM Users WHERE user_id = $1', [user_id]);
        if (userRes.rows.length > 0) {
            sendEmail(userRes.rows[0].email, 'Booking Confirmed', `Your booking ID is ${bookingId}`);
        }

        res.status(201).json({ message: 'Booking created successfully', bookingId });

    } catch (err) {
        // 4. Rollback nếu có lỗi (Hủy thay đổi)
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        // 5. Trả client về pool (Bắt buộc)
        client.release();
    }
};

const getBookings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, u.username 
            FROM Bookings b
            JOIN Users u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createBooking, getBookings };