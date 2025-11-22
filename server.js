const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- IMPORT ROUTERS (Đảm bảo file routes có tồn tại trong thư mục routes/) ---
// 1. Các tính năng CŨ (CRUD cơ bản)
const customerRoutes = require('./routes/customers');
const staffRoutes = require('./routes/staff');
const serviceRoutes = require('./routes/services');
const roomTypeRoutes = require('./routes/roomTypes');
const promotionRoutes = require('./routes/promotions');
const reviewRoutes = require('./routes/reviews');

// 2. Các tính năng MỚI (Auth, Booking, Invoice, Report, Room nâng cao)
// Lưu ý: Nếu bạn chưa có file routes/auth.js riêng, tôi sẽ khai báo trực tiếp controller ở đây để tránh lỗi.
const AuthController = require('./controllers/authController');
const RoomController = require('./controllers/roomController');
const BookingController = require('./controllers/bookingController');
const InvoiceController = require('./controllers/invoiceController');
const ReportController = require('./controllers/reportController');
const { verifyToken, isStaff } = require('./middleware/auth');

// --- ĐỊNH NGHĨA ROUTES ---

// A. Routes xác thực (Auth)
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/otp/request', AuthController.requestOTP);
app.post('/api/auth/otp/verify', AuthController.verifyOTP);

// B. Routes quản lý (CRUD) - Dùng Router riêng
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/promotions', promotionRoutes); // Đã sửa Controller ở Bước 1
app.use('/api/reviews', reviewRoutes);

// C. Routes nghiệp vụ nâng cao (Viết trực tiếp hoặc dùng Router nếu có)

// 1. Rooms (Kết hợp CRUD cũ và Tìm kiếm mới)
app.get('/api/rooms', RoomController.getAllRooms);
app.get('/api/rooms/search', RoomController.searchAvailableRooms); // API mới
app.get('/api/rooms/:id', RoomController.getRoomById);
app.post('/api/rooms', verifyToken, isStaff, RoomController.createRoom);
app.put('/api/rooms/:id/status', verifyToken, isStaff, RoomController.updateRoomStatus);

// 2. Bookings (Đặt phòng & Check-in/out)
app.post('/api/bookings', verifyToken, BookingController.createBooking);
app.get('/api/bookings/:id', verifyToken, BookingController.getBookingDetails);
app.post('/api/bookings/:id/services', verifyToken, BookingController.addService);
app.post('/api/bookings/:id/checkout', verifyToken, isStaff, BookingController.checkout);

// 3. Invoices (Hóa đơn)
app.post('/api/invoices/preview', verifyToken, InvoiceController.previewInvoice);
app.post('/api/invoices', verifyToken, isStaff, InvoiceController.createInvoice);
app.get('/api/invoices/:id', verifyToken, InvoiceController.getInvoiceDetail);
app.put('/api/invoices/:id/payment', verifyToken, isStaff, InvoiceController.updatePayment);

// 4. Reports (Báo cáo)
app.get('/api/reports/dashboard', verifyToken, isStaff, ReportController.getDashboard);
app.post('/api/reports/revenue', verifyToken, isStaff, ReportController.generateRevenueReport);
app.get('/api/reports', verifyToken, isStaff, ReportController.getAllReports);

// --- KHỞI ĐỘNG SERVER ---
app.get('/', (req, res) => {
    res.send('Hotel Management API is running (Fixed Version)...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});