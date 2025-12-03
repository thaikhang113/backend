const db = require('../config/db');
const BookingService = require('../services/bookingService');
const InvoiceService = require('../services/invoiceService');

const getFullBookingInfo = async (bookingId) => {
    // Logic lấy thông tin hiển thị (không cần transaction vì dữ liệu đã commit)
    const bookingQuery = `
        SELECT 
            b.booking_id, b.check_in, b.check_out, b.total_guests, b.status, b.booking_date,
            u.first_name, u.last_name,
            i.final_amount, p.promotion_code, i.invoice_id
        FROM Bookings b
        JOIN Users u ON b.user_id = u.user_id
        LEFT JOIN Invoices i ON b.booking_id = i.booking_id
        LEFT JOIN Promotions p ON i.promotion_id = p.promotion_id
        WHERE b.booking_id = $1
    `;
    const bookingRes = await db.query(bookingQuery, [bookingId]);
    
    if (bookingRes.rows.length === 0) return null;
    const booking = bookingRes.rows[0];

    const roomsQuery = `
        SELECT rt.name as room_type, r.bed_count, r.room_number, br.price_at_booking
        FROM Booked_Rooms br
        JOIN Rooms r ON br.room_id = r.room_id
        JOIN Room_Types rt ON r.room_type_id = rt.room_type_id
        WHERE br.booking_id = $1
    `;
    const roomsRes = await db.query(roomsQuery, [bookingId]);

    const servicesQuery = `
        SELECT s.name, us.quantity, us.service_price
        FROM Used_Services us
        JOIN Services s ON us.service_id = s.service_id
        WHERE us.booking_id = $1
    `;
    const servicesRes = await db.query(servicesQuery, [bookingId]);

    let totalMoney = booking.final_amount ? parseFloat(booking.final_amount) : 0;
    
    if (!booking.final_amount) {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const diffTime = Math.abs(checkOut - checkIn);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        
        let roomTotal = 0;
        roomsRes.rows.forEach(r => {
            roomTotal += parseFloat(r.price_at_booking) * nights;
        });
        
        let serviceTotal = 0;
        servicesRes.rows.forEach(s => {
            serviceTotal += parseFloat(s.service_price) * s.quantity;
        });
        
        totalMoney = roomTotal + serviceTotal;
    }

    return {
        booking_id: booking.booking_id,
        invoice_id: booking.invoice_id || null,
        customer_name: `${booking.first_name} ${booking.last_name}`.trim(),
        rooms: roomsRes.rows.map(r => ({
            room_type: r.room_type,
            bed_count: r.bed_count,
            room_number: r.room_number
        })),
        total_guests: booking.total_guests,
        services: servicesRes.rows.map(s => ({
            name: s.name,
            quantity: s.quantity
        })),
        promotion_code: booking.promotion_code || null,
        total_amount: totalMoney,
        check_in: booking.check_in,
        check_out: booking.check_out,
        status: booking.status
    };
};

const BookingController = {
    createBooking: async (req, res) => {
        const client = await db.getClient();
        try {
            await client.query('BEGIN'); // Bắt đầu transaction

            const userId = req.body.user_id;
            if (!userId) {
                throw new Error("Vui lòng cung cấp 'user_id'.");
            }

            const { promotionCode } = req.body;

            // 1. Tạo Booking + Phòng + Dịch vụ (trong cùng transaction)
            const booking = await BookingService.createBooking(userId, req.body, client);

            // 2. Tạo Invoice + Áp mã giảm giá (dùng chung transaction để thấy booking vừa tạo)
            await InvoiceService.createInvoice(1, booking.booking_id, promotionCode, client);

            await client.query('COMMIT'); // Lưu tất cả vào DB

            // 3. Lấy lại thông tin đầy đủ để trả về
            const fullDetail = await getFullBookingInfo(booking.booking_id);
            
            res.status(201).json({
                message: 'Đặt phòng và áp dụng dịch vụ/khuyến mãi thành công',
                data: fullDetail
            });
        } catch (error) {
            await client.query('ROLLBACK'); // Hủy toàn bộ nếu có lỗi
            console.error("Booking Transaction Failed:", error);
            res.status(400).json({ message: error.message });
        } finally {
            client.release();
        }
    },

    getBookingDetails: async (req, res) => {
        try {
            const bookingId = req.params.id;
            
            if (!bookingId || bookingId === 'undefined') {
                 const query = `
                    SELECT b.booking_id, b.check_in, b.check_out, b.status, 
                           u.username, u.first_name, u.last_name, b.total_guests
                    FROM Bookings b 
                    JOIN Users u ON b.user_id = u.user_id 
                    ORDER BY b.booking_date DESC`;
                 const result = await db.query(query);
                 return res.json(result.rows);
            }

            const fullDetail = await getFullBookingInfo(bookingId);
            if (!fullDetail) return res.status(404).json({ message: 'Booking not found' });

            res.json(fullDetail);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addService: async (req, res) => {
        try {
            const { serviceCode, quantity, roomId, room_id } = req.body;
            const targetRoomId = roomId || room_id;
            const bookingId = req.params.id;
            
            // Hàm addServiceToRoom có thể cần update nếu muốn hỗ trợ transaction, 
            // nhưng ở đây request đơn lẻ nên dùng db mặc định là ổn.
            const result = await BookingService.addServiceToRoom(bookingId, serviceCode, quantity, targetRoomId);
            res.json({ message: 'Thêm dịch vụ thành công', result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    checkout: async (req, res) => {
        try {
            const bookingId = req.params.id;
            await BookingService.checkOut(bookingId);
            res.json({ message: 'Check-out thành công. Phòng đã chuyển sang trạng thái dọn dẹp.' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    updateBooking: async (req, res) => {
        const { id } = req.params;
        const { check_in, check_out, status, total_guests } = req.body;
        
        try {
            const oldBooking = await db.query('SELECT * FROM Bookings WHERE booking_id = $1', [id]);
            if (oldBooking.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
            
            const existing = oldBooking.rows[0];
            const newCheckIn = check_in || existing.check_in;
            const newCheckOut = check_out || existing.check_out;
            const newStatus = status || existing.status;
            const newGuests = total_guests || existing.total_guests;

            const result = await db.query(
                'UPDATE Bookings SET check_in = $1, check_out = $2, status = $3, total_guests = $4 WHERE booking_id = $5 RETURNING *',
                [newCheckIn, newCheckOut, newStatus, newGuests, id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteBooking: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM Booked_Rooms WHERE booking_id = $1', [id]);
            await db.query('DELETE FROM Used_Services WHERE booking_id = $1', [id]);
            const result = await db.query('DELETE FROM Bookings WHERE booking_id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
            res.json({ message: 'Booking deleted successfully' });
        } catch (error) {
            if (error.code === '23503') {
                await db.query("UPDATE Bookings SET status = 'cancelled' WHERE booking_id = $1", [id]);
                return res.json({ message: 'Booking has invoice, status changed to Cancelled instead of delete.' });
            }
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = BookingController;