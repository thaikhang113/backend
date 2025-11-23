const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- MIDDLEWARE GIẢ LẬP NGƯỜI DÙNG (THAY THẾ AUTH) ---
// Vì đã xóa Auth, ta cần gán một user mặc định vào req để các Controller không bị lỗi khi gọi req.user
app.use((req, res, next) => {
    req.user = {
        user_id: 1, // ID mặc định của Admin hệ thống
        username: 'system_admin',
        email: 'admin@hotel.com',
        is_staff: true
    };
    next();
});

// --- IMPORT TOÀN BỘ CONTROLLERS ---
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

// ======================== ROUTES DEFINITION ========================
// Lưu ý: Đã xóa toàn bộ Auth Middleware

// 1. STAFF (Nhân viên - Full CRUD)
app.get('/api/staff', StaffController.getAllStaff);
app.get('/api/staff/:id', StaffController.getStaffById);
app.post('/api/staff', StaffController.createStaff);
app.put('/api/staff/:id', StaffController.updateStaff);
app.delete('/api/staff/:id', StaffController.deleteStaff);

// 2. CUSTOMERS (Khách hàng - Full CRUD)
app.get('/api/customers', CustomerController.getAllCustomers);
app.get('/api/customers/:id', CustomerController.getCustomerById);
app.post('/api/customers', CustomerController.createCustomer); 
app.put('/api/customers/:id', CustomerController.updateCustomer);
app.delete('/api/customers/:id', CustomerController.deleteCustomer);

// 3. ROOM TYPES (Loại phòng - Full CRUD)
app.get('/api/room-types', RoomTypeController.getAllRoomTypes);
app.get('/api/room-types/:id', RoomTypeController.getRoomTypeById);
app.post('/api/room-types', RoomTypeController.createRoomType);
app.put('/api/room-types/:id', RoomTypeController.updateRoomType);
app.delete('/api/room-types/:id', RoomTypeController.deleteRoomType);

// 4. ROOMS (Phòng - Full CRUD + Search)
app.get('/api/rooms/search', RoomController.searchAvailableRooms);
app.get('/api/rooms', RoomController.getAllRooms);
app.get('/api/rooms/:id', RoomController.getRoomById);
app.post('/api/rooms', RoomController.createRoom);
app.put('/api/rooms/:id', RoomController.updateRoom);
app.put('/api/rooms/:id/status', RoomController.updateRoomStatus);
app.delete('/api/rooms/:id', RoomController.deleteRoom);

// 5. SERVICES (Dịch vụ - Full CRUD)
app.get('/api/services', ServiceController.getAllServices);
app.get('/api/services/:id', ServiceController.getServiceById);
app.post('/api/services', ServiceController.createService);
app.put('/api/services/:id', ServiceController.updateService);
app.delete('/api/services/:id', ServiceController.deleteService);

// 6. BOOKINGS (Đặt phòng - Full CRUD + Nghệp vụ)
app.post('/api/bookings', BookingController.createBooking);
app.get('/api/bookings', BookingController.getBookingDetails);
app.get('/api/bookings/:id', BookingController.getBookingDetails);
app.put('/api/bookings/:id', BookingController.updateBooking);
app.delete('/api/bookings/:id', BookingController.deleteBooking);
app.post('/api/bookings/:id/services', BookingController.addService);
app.post('/api/bookings/:id/checkout', BookingController.checkout);

// 7. INVOICES (Hóa đơn - Full CRUD)
app.post('/api/invoices/preview', InvoiceController.previewInvoice);
app.post('/api/invoices', InvoiceController.createInvoice);
app.get('/api/invoices', InvoiceController.getAllInvoices);
app.get('/api/invoices/:id', InvoiceController.getInvoiceDetail);
app.put('/api/invoices/:id/payment', InvoiceController.updatePayment);
app.delete('/api/invoices/:id', InvoiceController.deleteInvoice);

// 8. PROMOTIONS (Khuyến mãi - Full CRUD)
app.get('/api/promotions', PromotionController.getAllPromotions);
app.get('/api/promotions/:id', PromotionController.getPromotionById);
app.post('/api/promotions', PromotionController.createPromotion);
app.put('/api/promotions/:id', PromotionController.updatePromotion);
app.delete('/api/promotions/:id', PromotionController.deletePromotion);

// 9. REVIEWS (Đánh giá - Full CRUD)
app.get('/api/reviews', ReviewController.getReviews);
app.get('/api/reviews/:id', ReviewController.getReviewById);
app.post('/api/reviews', ReviewController.addReview);
app.put('/api/reviews/:id', ReviewController.updateReview);
app.delete('/api/reviews/:id', ReviewController.deleteReview);

// 10. REPORTS (Báo cáo)
app.get('/api/reports/dashboard', ReportController.getDashboard);
app.post('/api/reports/revenue', ReportController.generateRevenueReport);
app.get('/api/reports', ReportController.getAllReports);

app.get('/', (req, res) => {
    res.send('Hotel Management API is running (No Auth Mode)...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});