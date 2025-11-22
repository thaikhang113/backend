const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const RoomController = require('../controllers/roomController');
const BookingController = require('../controllers/bookingController');
const InvoiceController = require('../controllers/invoiceController');
const ReportController = require('../controllers/reportController');
const { verifyToken, isStaff } = require('../middleware/auth');

// --- AUTH ROUTES ---
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/otp/request', AuthController.requestOTP);
router.post('/auth/otp/verify', AuthController.verifyOTP);

// --- ROOM ROUTES ---
router.get('/rooms', RoomController.getAllRooms);
router.get('/rooms/search', RoomController.searchAvailableRooms); // ?checkIn=...&checkOut=...
router.get('/rooms/:id', RoomController.getRoomById);
router.post('/rooms', verifyToken, isStaff, RoomController.createRoom);
router.put('/rooms/:id/status', verifyToken, isStaff, RoomController.updateRoomStatus);

// --- BOOKING ROUTES ---
router.post('/bookings', verifyToken, BookingController.createBooking);
router.get('/bookings/:id', verifyToken, BookingController.getBookingDetails);
router.post('/bookings/:id/services', verifyToken, BookingController.addService); // Add service to booking
router.post('/bookings/:id/checkout', verifyToken, isStaff, BookingController.checkout);

// --- INVOICE ROUTES ---
router.post('/invoices/preview', verifyToken, InvoiceController.previewInvoice);
router.post('/invoices', verifyToken, isStaff, InvoiceController.createInvoice);
router.get('/invoices/:id', verifyToken, InvoiceController.getInvoiceDetail);
router.put('/invoices/:id/payment', verifyToken, isStaff, InvoiceController.updatePayment);

// --- REPORT ROUTES ---
router.get('/reports/dashboard', verifyToken, isStaff, ReportController.getDashboard);
router.post('/reports/revenue', verifyToken, isStaff, ReportController.generateRevenueReport);
router.get('/reports', verifyToken, isStaff, ReportController.getAllReports);

module.exports = router;