const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- IMPORT TOÀN BỘ CONTROLLERS ---
const AuthController = require('./controllers/authController');
const RoomController = require('./controllers/roomController');
const BookingController = require('./controllers/bookingController');
const InvoiceController = require('./controllers/invoiceController');
const ReportController = require('./controllers/reportController');
const StaffController = require('./controllers/staffController');
const CustomerController = require('./controllers/customerController');
const ServiceController = require('./controllers/serviceController');
const RoomTypeController = require('./controllers/roomTypeController');
const PromotionController = require('./controllers/promotionController');
const ReviewController = require('./controllers/reviewController');

const { verifyToken, isStaff } = require('./middleware/auth');

// ======================== ROUTES DEFINITION ========================

// 1. AUTH (Xác thực)
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/otp/request', AuthController.requestOTP);
app.post('/api/auth/otp/verify', AuthController.verifyOTP);

// 2. STAFF (Nhân viên - Full CRUD)
app.get('/api/staff', verifyToken, isStaff, StaffController.getAllStaff);
app.get('/api/staff/:id', verifyToken, isStaff, StaffController.getStaffById);
app.post('/api/staff', verifyToken, isStaff, StaffController.createStaff);
app.put('/api/staff/:id', verifyToken, isStaff, StaffController.updateStaff);
app.delete('/api/staff/:id', verifyToken, isStaff, StaffController.deleteStaff);

// 3. CUSTOMERS (Khách hàng - Full CRUD)
app.get('/api/customers', verifyToken, isStaff, CustomerController.getAllCustomers);
app.get('/api/customers/:id', verifyToken, CustomerController.getCustomerById);
app.post('/api/customers', CustomerController.createCustomer); // Public Register
app.put('/api/customers/:id', verifyToken, CustomerController.updateCustomer);
app.delete('/api/customers/:id', verifyToken, isStaff, CustomerController.deleteCustomer);

// 4. ROOM TYPES (Loại phòng - Full CRUD)
app.get('/api/room-types', RoomTypeController.getAllRoomTypes);
app.get('/api/room-types/:id', RoomTypeController.getRoomTypeById);
app.post('/api/room-types', verifyToken, isStaff, RoomTypeController.createRoomType);
app.put('/api/room-types/:id', verifyToken, isStaff, RoomTypeController.updateRoomType);
app.delete('/api/room-types/:id', verifyToken, isStaff, RoomTypeController.deleteRoomType);

// 5. ROOMS (Phòng - Full CRUD + Search)
app.get('/api/rooms/search', RoomController.searchAvailableRooms); // Tìm kiếm
app.get('/api/rooms', RoomController.getAllRooms);
app.get('/api/rooms/:id', RoomController.getRoomById);
app.post('/api/rooms', verifyToken, isStaff, RoomController.createRoom);
app.put('/api/rooms/:id', verifyToken, isStaff, RoomController.updateRoom);
app.put('/api/rooms/:id/status', verifyToken, isStaff, RoomController.updateRoomStatus);
app.delete('/api/rooms/:id', verifyToken, isStaff, RoomController.deleteRoom);

// 6. SERVICES (Dịch vụ - Full CRUD)
app.get('/api/services', ServiceController.getAllServices);
app.get('/api/services/:id', ServiceController.getServiceById);
app.post('/api/services', verifyToken, isStaff, ServiceController.createService);
app.put('/api/services/:id', verifyToken, isStaff, ServiceController.updateService);
app.delete('/api/services/:id', verifyToken, isStaff, ServiceController.deleteService);

// 7. BOOKINGS (Đặt phòng - Full CRUD + Nghệp vụ)
app.post('/api/bookings', verifyToken, BookingController.createBooking);       // Tạo booking
app.get('/api/bookings', verifyToken, BookingController.getBookingDetails);    // Lấy danh sách (User/All)
app.get('/api/bookings/:id', verifyToken, BookingController.getBookingDetails);// Lấy chi tiết
app.put('/api/bookings/:id', verifyToken, BookingController.updateBooking);    // Sửa (Ngày, Status)
app.delete('/api/bookings/:id', verifyToken, BookingController.deleteBooking); // Xóa
app.post('/api/bookings/:id/services', verifyToken, BookingController.addService); // Thêm dịch vụ
app.post('/api/bookings/:id/checkout', verifyToken, isStaff, BookingController.checkout); // Checkout

// 8. INVOICES (Hóa đơn - Full CRUD)
app.post('/api/invoices/preview', verifyToken, InvoiceController.previewInvoice);
app.post('/api/invoices', verifyToken, isStaff, InvoiceController.createInvoice);
app.get('/api/invoices', verifyToken, InvoiceController.getAllInvoices);
app.get('/api/invoices/:id', verifyToken, InvoiceController.getInvoiceDetail);
app.put('/api/invoices/:id/payment', verifyToken, isStaff, InvoiceController.updatePayment);
app.delete('/api/invoices/:id', verifyToken, isStaff, InvoiceController.deleteInvoice);

// 9. PROMOTIONS (Khuyến mãi - Full CRUD)
app.get('/api/promotions', PromotionController.getAllPromotions);
app.get('/api/promotions/:id', PromotionController.getPromotionById);
app.post('/api/promotions', verifyToken, isStaff, PromotionController.createPromotion);
app.put('/api/promotions/:id', verifyToken, isStaff, PromotionController.updatePromotion);
app.delete('/api/promotions/:id', verifyToken, isStaff, PromotionController.deletePromotion);

// 10. REVIEWS (Đánh giá - Full CRUD)
app.get('/api/reviews', ReviewController.getReviews);
app.get('/api/reviews/:id', ReviewController.getReviewById);
app.post('/api/reviews', verifyToken, ReviewController.addReview);
app.put('/api/reviews/:id', verifyToken, ReviewController.updateReview);
app.delete('/api/reviews/:id', verifyToken, ReviewController.deleteReview);

// 11. REPORTS (Báo cáo)
app.get('/api/reports/dashboard', verifyToken, isStaff, ReportController.getDashboard);
app.post('/api/reports/revenue', verifyToken, isStaff, ReportController.generateRevenueReport);
app.get('/api/reports', verifyToken, isStaff, ReportController.getAllReports);

app.get('/', (req, res) => {
    res.send('Hotel Management API is running (Full CRUD v2)...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});