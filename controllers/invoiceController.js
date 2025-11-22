const InvoiceService = require('../services/invoiceService');
const InvoiceRepository = require('../repositories/invoiceRepository');
const Invoice = require('../models/invoice');

const InvoiceController = {
    // Xem trước tính toán hóa đơn (Preview)
    previewInvoice: async (req, res) => {
        try {
            const { bookingId, promoCode } = req.body;
            const calculation = await InvoiceService.calculateTotal(bookingId, promoCode);
            res.json(calculation);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Tạo hóa đơn chính thức
    createInvoice: async (req, res) => {
        try {
            const { bookingId, promoCode } = req.body;
            const staffId = req.user ? req.user.user_id : 1; // Fallback if no auth middleware used in testing
            const invoice = await InvoiceService.createInvoice(staffId, bookingId, promoCode);
            res.status(201).json({ message: 'Hóa đơn đã được tạo và gửi email', invoice });
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

    updatePayment: async (req, res) => {
        try {
            const { status, method } = req.body;
            const updated = await Invoice.updatePaymentStatus(req.params.id, status, method);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = InvoiceController;