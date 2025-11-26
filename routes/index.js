const express = require('express');
const router = express.Router();

const RoomController = require('../controllers/roomController');
const BookingController = require('../controllers/bookingController');
const InvoiceController = require('../controllers/invoiceController');
const ReportController = require('../controllers/reportController');

router.get('/rooms', RoomController.getAllRooms);
router.get('/rooms/search', RoomController.searchAvailableRooms);
router.get('/rooms/:id', RoomController.getRoomById);
router.post('/rooms', RoomController.createRoom);
router.put('/rooms/:id/status', RoomController.updateRoomStatus);

router.post('/bookings', BookingController.createBooking);
router.get('/bookings/:id', BookingController.getBookingDetails);
router.post('/bookings/:id/services', BookingController.addService);
router.post('/bookings/:id/checkout', BookingController.checkout);

router.post('/invoices/preview', InvoiceController.previewInvoice);
router.post('/invoices', InvoiceController.createInvoice);
router.get('/invoices/:id', InvoiceController.getInvoiceDetail);
router.put('/invoices/:id/payment', InvoiceController.updatePayment);

router.get('/reports/dashboard', ReportController.getDashboard);
router.post('/reports/revenue', ReportController.generateRevenueReport);
router.get('/reports', ReportController.getAllReports);

module.exports = router;