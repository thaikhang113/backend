const InvoiceService = require('../services/invoiceService');
const InvoiceRepository = require('../repositories/invoiceRepository');
const db = require('../config/db');

const InvoiceController = {
    previewInvoice: async (req, res) => {
        try {
            const { bookingId, promoCode } = req.body;
            const calculation = await InvoiceService.calculateTotal(bookingId, promoCode);
            res.json(calculation);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    createInvoice: async (req, res) => {
        try {
            const { bookingId, promoCode } = req.body;
            const staffId = req.user ? req.user.user_id : 1;
            const invoice = await InvoiceService.createInvoice(staffId, bookingId, promoCode);
            res.status(201).json({ message: 'Hóa đơn đã được tạo', invoice });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getInvoiceDetail: async (req, res) => {
        try {
            const details = await InvoiceRepository.getInvoiceDetailFull(req.params.id);
            if (!details) return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
            res.json(details);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllInvoices: async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM Invoices ORDER BY issue_date DESC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updatePayment: async (req, res) => {
        try {
            const { status, method } = req.body;
            const result = await db.query(
                'UPDATE Invoices SET payment_status = $1, payment_method = $2 WHERE invoice_id = $3 RETURNING *',
                [status, method, req.params.id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteInvoice: async (req, res) => {
        try {
            const result = await db.query('DELETE FROM Invoices WHERE invoice_id = $1 RETURNING *', [req.params.id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
            res.json({ message: 'Invoice deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = InvoiceController;