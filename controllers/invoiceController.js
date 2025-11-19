const db = require('../config/db');

const createInvoice = async (req, res) => {
    const { booking_id, payment_method } = req.body;
    try {
        // 1. Tính tổng tiền từ Booked_Rooms và Used_Services
        // (Đây là logic rút gọn, thực tế phức tạp hơn nhiều)
        const roomTotalRes = await db.query(
            'SELECT SUM(price_at_booking) as total FROM Booked_Rooms WHERE booking_id = $1', 
            [booking_id]
        );
        
        const serviceTotalRes = await db.query(
            'SELECT SUM(price_at_usage * quantity) as total FROM Used_Services WHERE booking_id = $1',
            [booking_id]
        );

        const totalAmount = (Number(roomTotalRes.rows[0].total) || 0) + (Number(serviceTotalRes.rows[0].total) || 0);

        // 2. Tạo Invoice
        const query = `
            INSERT INTO Invoices (booking_id, issue_date, total_amount, tax_amount, payment_status, payment_method)
            VALUES ($1, NOW(), $2, $3, 'paid', $4)
            RETURNING *
        `;
        const tax = totalAmount * 0.1; // 10% VAT
        const result = await db.query(query, [booking_id, totalAmount, tax, payment_method]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createInvoice };