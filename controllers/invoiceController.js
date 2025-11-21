const db = require('../config/db');

const getAllInvoices = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Invoices ORDER BY issue_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getInvoiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Invoices WHERE invoice_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createInvoice = async (req, res) => {
    const { booking_id, payment_method, staff_id } = req.body;
    try {
        const roomTotalRes = await db.query(
            'SELECT SUM(price_at_booking) as total FROM Booked_Rooms WHERE booking_id = $1', 
            [booking_id]
        );
        
        const serviceTotalRes = await db.query(
            'SELECT SUM(service_price * quantity) as total FROM Used_Services WHERE booking_id = $1',
            [booking_id]
        );

        const roomTotal = Number(roomTotalRes.rows[0].total) || 0;
        const serviceTotal = Number(serviceTotalRes.rows[0].total) || 0;
        const totalAmount = roomTotal + serviceTotal;
        const tax = totalAmount * 0.1; // 10% VAT
        const finalAmount = totalAmount + tax;

        const query = `
            INSERT INTO Invoices (booking_id, staff_id, issue_date, total_room_cost, total_service_cost, total_amount, vat_amount, final_amount, payment_status, payment_method)
            VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, 'paid', $8)
            RETURNING *
        `;
        const result = await db.query(query, [booking_id, staff_id, roomTotal, serviceTotal, totalAmount, tax, finalAmount, payment_method]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateInvoice = async (req, res) => {
    const { id } = req.params;
    const { payment_status, payment_method } = req.body;
    try {
        const result = await db.query(
            'UPDATE Invoices SET payment_status=$1, payment_method=$2 WHERE invoice_id=$3 RETURNING *',
            [payment_status, payment_method, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteInvoice = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Invoices WHERE invoice_id = $1 RETURNING invoice_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
        res.json({ message: 'Invoice deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice };