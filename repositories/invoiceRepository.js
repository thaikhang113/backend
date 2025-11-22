const db = require('../config/db');

const InvoiceRepository = {
    // Lấy chi tiết hóa đơn đầy đủ (Thông tin booking, phòng, dịch vụ) để in
    getInvoiceDetailFull: async (invoiceId) => {
        // Lấy thông tin chung
        const invoiceQuery = `
            SELECT i.*, b.check_in, b.check_out, u.first_name || ' ' || u.last_name as customer_name, u.email, u.phone_number
            FROM Invoices i
            JOIN Bookings b ON i.booking_id = b.booking_id
            JOIN Users u ON b.user_id = u.user_id
            WHERE i.invoice_id = $1
        `;
        
        // Lấy danh sách phòng
        const roomsQuery = `
            SELECT r.room_number, rt.name as type, br.price_at_booking
            FROM Booked_Rooms br
            JOIN Rooms r ON br.room_id = r.room_id
            JOIN Room_Types rt ON r.room_type_id = rt.room_type_id
            JOIN Invoices i ON br.booking_id = i.booking_id
            WHERE i.invoice_id = $1
        `;

        // Lấy danh sách dịch vụ
        const servicesQuery = `
            SELECT s.name, us.quantity, us.service_price, (us.quantity * us.service_price) as total
            FROM Used_Services us
            JOIN Services s ON us.service_id = s.service_id
            JOIN Invoices i ON us.booking_id = i.booking_id
            WHERE i.invoice_id = $1
        `;

        const [invoice, rooms, services] = await Promise.all([
            db.query(invoiceQuery, [invoiceId]),
            db.query(roomsQuery, [invoiceId]),
            db.query(servicesQuery, [invoiceId])
        ]);

        if (invoice.rows.length === 0) return null;

        return {
            info: invoice.rows[0],
            rooms: rooms.rows,
            services: services.rows
        };
    }
};

module.exports = InvoiceRepository;