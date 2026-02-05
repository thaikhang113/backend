-- ============================================
-- DATABASE: Hotel Management System
-- ============================================

-- Clean up
DROP TABLE IF EXISTS Room_Status_History, Reviews, Invoices, Used_Services, Services, Booked_Rooms, Bookings, Rooms, Room_Types, Promotions, Users;

-- ==========================
-- TABLE: Users
-- ==========================
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    gender VARCHAR(10),
    phone_number VARCHAR(20),
    address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_of_birth DATE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- ==========================
-- TABLE: Room_Types
-- ==========================
CREATE TABLE Room_Types (
    room_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- ==========================
-- TABLE: Rooms
-- ==========================
CREATE TABLE Rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type_id INTEGER REFERENCES Room_Types(room_type_id),
    floor INTEGER,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INTEGER,
    bed_count INTEGER,
    description TEXT,
    status VARCHAR(20) DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE -- Column added per requirement
);

-- ==========================
-- TABLE: Services
-- ==========================
CREATE TABLE Services (
    service_id SERIAL PRIMARY KEY,
    service_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- ==========================
-- TABLE: Promotions
-- ==========================
CREATE TABLE Promotions (
    promotion_id SERIAL PRIMARY KEY,
    promotion_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    discount_value DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    scope VARCHAR(20) DEFAULT 'invoice',
    description TEXT
);

-- ==========================
-- TABLE: Bookings
-- ==========================
CREATE TABLE Bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    total_guests INTEGER,
    promotion_id INTEGER REFERENCES Promotions(promotion_id),
    number_of_days INTEGER,
    number_of_nights INTEGER,
    total_price DECIMAL(10,2)
);

-- ==========================
-- TABLE: Booked_Rooms
-- ==========================
CREATE TABLE Booked_Rooms (
    booked_room_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES Bookings(booking_id),
    room_id INTEGER REFERENCES Rooms(room_id),
    price_at_booking DECIMAL(10,2)
);

-- ==========================
-- TABLE: Used_Services
-- ==========================
CREATE TABLE Used_Services (
    used_service_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES Bookings(booking_id),
    service_id INTEGER REFERENCES Services(service_id),
    quantity INTEGER DEFAULT 1,
    service_price DECIMAL(10,2),
    service_date TIMESTAMP
);

-- ==========================
-- TABLE: Invoices
-- ==========================
CREATE TABLE Invoices (
    invoice_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES Bookings(booking_id),
    staff_id INTEGER REFERENCES Users(user_id),
    issue_date DATE DEFAULT CURRENT_DATE,
    total_room_cost DECIMAL(10,2),
    total_service_cost DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    vat_amount DECIMAL(10,2),
    payment_method VARCHAR(50) DEFAULT 'cash',
    promotion_id INTEGER REFERENCES Promotions(promotion_id),
    payment_status VARCHAR(20) DEFAULT 'paid',
    total_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2)
);

-- ==========================
-- TABLE: Reviews
-- ==========================
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES Bookings(booking_id),
    user_id INTEGER REFERENCES Users(user_id),
    room_id INTEGER REFERENCES Rooms(room_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- TABLE: Room_Status_History
-- ==========================
CREATE TABLE Room_Status_History (
    history_id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES Rooms(room_id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INTEGER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DATA INSERTION (Extended Dataset)
-- ============================================

-- USERS
INSERT INTO Users 
(password_hash, username, email, first_name, last_name, gender, phone_number, address, date_of_birth, is_staff) 
VALUES
('123', 'nguyenvana', 'an.nguyen@gmail.com', 'An', 'Nguyễn Văn', 'Male', '0905123456', 'Quận 1, TP.HCM', '1993-09-11', TRUE),
('123', 'tranthib', 'bich.tran@gmail.com', 'Bích', 'Trần Thị', 'Female', '0905234567', 'Quận Hải Châu, Đà Nẵng', '1998-03-21', TRUE),
('123', 'lehoangc', 'cuong.le@gmail.com', 'Cường', 'Lê Hoàng', 'Male', '0905345678', 'Quận Cầu Giấy, Hà Nội', '1991-07-19', FALSE),
('123', 'phamthid', 'dung.pham@gmail.com', 'Dung', 'Phạm Thị', 'Female', '0905456789', 'TP. Thủ Đức, TP.HCM', '1993-08-26', FALSE),
('123', 'vominhe', 'em.vo@gmail.com', 'Em', 'Võ Minh', 'Male', '0905567890', 'TP. Biên Hòa, Đồng Nai', '1997-02-17', FALSE),
('123', 'dothif', 'fiona.do@gmail.com', 'Phương', 'Đỗ Thị', 'Female', '0905678901', 'TP. Nha Trang, Khánh Hòa', '1990-08-28', TRUE),
('123', 'buingocg', 'giang.bui@gmail.com', 'Giang', 'Bùi Ngọc', 'Female', '0905789012', 'TP. Huế, Thừa Thiên Huế', '1996-08-19', FALSE),
('123', 'hoangminhh', 'hoang.minh@gmail.com', 'Hoàng', 'Nguyễn Minh', 'Male', '0905890123', 'Quận Bình Thạnh, TP.HCM', '1991-03-16', FALSE),
('123', 'truongthui', 'ivy.truong@gmail.com', 'Thư', 'Trương Thu', 'Female', '0905901234', 'TP. Cần Thơ', '1990-02-15', FALSE),
('123', 'nguyenk', 'khanh.nguyen@gmail.com', 'Khánh', 'Nguyễn', 'Male', '0906012345', 'Quận Ba Đình, Hà Nội', '1990-07-13', TRUE),
('123', 'lethel', 'linh.le@gmail.com', 'Linh', 'Lê Thế', 'Female', '0906123456', 'Quận 7, TP.HCM', '1999-02-25', TRUE),
('123', 'phammanhm', 'manh.pham@gmail.com', 'Mạnh', 'Phạm Anh', 'Male', '0906234567', 'TP. Vũng Tàu', '1991-05-15', TRUE),
('123', 'ngoquynhn', 'ngoc.ngo@gmail.com', 'Ngọc', 'Ngô Quỳnh', 'Female', '0906345678', 'TP. Đà Lạt, Lâm Đồng', '1998-07-21', FALSE),
('123', 'tranducp', 'phu.tran@gmail.com', 'Phú', 'Trần Đức', 'Male', '0906456789', 'TP. Quy Nhơn, Bình Định', '1994-04-27', FALSE),
('123', 'vuthiq', 'quyen.vu@gmail.com', 'Quyên', 'Vũ Thị', 'Female', '0906567890', 'TP. Long Xuyên, An Giang', '1998-08-22', FALSE),
('123', 'hoangr', 'ron.hoang@gmail.com', 'Rôn', 'Hoàng', 'Male', '0906678901', 'TP. Rạch Giá, Kiên Giang', '1996-07-27', FALSE),
('123', 'dangs', 'son.dang@gmail.com', 'Sơn', 'Đặng', 'Male', '0906789012', 'Quận Thanh Xuân, Hà Nội', '1995-04-14', TRUE),
('123', 'lythit', 'thao.ly@gmail.com', 'Thảo', 'Lý Thị', 'Female', '0906890123', 'TP. Bắc Ninh, Bắc Ninh', '1997-07-20', TRUE),
('123', 'phungu', 'uyen.phung@gmail.com', 'Uyên', 'Phùng', 'Female', '0906901234', 'TP. Buôn Ma Thuột, Đắk Lắk', '1991-05-22', TRUE),
('123', 'tranv', 'viet.tran@gmail.com', 'Việt', 'Trần', 'Male', '0906011122', 'TP. Hải Phòng', '1997-05-17', TRUE);

-- ROOM TYPES
INSERT INTO Room_Types (name, description) VALUES
('Standard', 'Phòng tiêu chuẩn với 1 giường đôi hoặc queen, đầy đủ tiện nghi cơ bản, phù hợp khách lưu trú ngắn ngày'),
('Deluxe', 'Phòng cao cấp rộng rãi hơn, cửa sổ lớn hoặc view thành phố, nội thất hiện đại và thoải mái'),
('Suite', 'Phòng hạng sang có khu tiếp khách riêng, giường king size và phòng tắm cao cấp'),
('Family', 'Phòng diện tích lớn dành cho gia đình, nhiều giường ngủ và không gian sinh hoạt chung'),
('Twin', 'Phòng gồm 2 giường đơn riêng biệt, phù hợp bạn bè hoặc khách đi công tác cùng nhau');


-- ROOMS
INSERT INTO Rooms 
(room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status) 
VALUES
('101', 4, 4, 750000, 2, 2, 'Phòng Twin hướng thành phố, 2 giường đơn, phù hợp bạn bè hoặc đồng nghiệp', 'booked'),
('102', 1, 3, 950000, 2, 1, 'Phòng Standard giường đôi, thiết kế hiện đại, đầy đủ tiện nghi cơ bản', 'available'),
('103', 3, 1, 1200000, 4, 2, 'Phòng Family rộng rãi, 1 giường đôi và 1 giường đơn, phù hợp gia đình nhỏ', 'booked'),
('104', 2, 3, 1100000, 3, 1, 'Phòng Deluxe giường queen, có cửa sổ lớn đón ánh sáng tự nhiên', 'available'),
('105', 2, 3, 1150000, 3, 1, 'Phòng Deluxe view thành phố, nội thất cao cấp, đang bảo trì điều hòa', 'maintenance'),
('106', 3, 5, 1350000, 4, 2, 'Phòng Family tầng cao, không gian yên tĩnh, phù hợp gia đình nghỉ dưỡng', 'booked'),
('107', 3, 4, 1280000, 4, 2, 'Phòng Family có ban công nhỏ, bàn làm việc và khu tiếp khách', 'available'),
('108', 1, 4, 980000, 2, 1, 'Phòng Standard giường đôi, gần thang máy, thuận tiện di chuyển', 'booked'),
('109', 5, 2, 1800000, 2, 1, 'Phòng Suite cao cấp, phòng khách riêng và giường king size', 'booked'),
('110', 5, 2, 1850000, 2, 1, 'Suite hướng vườn, bồn tắm nằm, không gian sang trọng', 'booked'),
('111', 4, 5, 820000, 2, 2, 'Phòng Twin tầng cao, 2 giường đơn, cửa sổ lớn nhìn ra thành phố', 'booked'),
('112', 2, 5, 1180000, 3, 1, 'Phòng Deluxe tầng cao, đang bảo trì hệ thống nước nóng', 'maintenance'),
('113', 3, 2, 1250000, 4, 2, 'Phòng Family gần khu tiện ích, hiện đang bảo trì nội thất', 'maintenance'),
('114', 5, 2, 1750000, 2, 1, 'Suite sang trọng với khu tiếp khách riêng và minibar miễn phí', 'booked'),
('115', 4, 3, 780000, 2, 2, 'Phòng Twin tiêu chuẩn, phù hợp khách công tác', 'booked'),
('116', 5, 2, 1700000, 2, 1, 'Suite rộng rãi, sofa tiếp khách, phòng tắm cao cấp', 'available'),
('117', 1, 3, 970000, 2, 1, 'Phòng Standard nội thất gỗ ấm cúng, phù hợp cặp đôi', 'booked'),
('118', 2, 1, 1050000, 3, 1, 'Phòng Deluxe tầng thấp, hiện đang bảo trì hệ thống điện', 'maintenance'),
('119', 3, 3, 1230000, 4, 2, 'Phòng Family thiết kế hiện đại, đang tạm ngưng để bảo trì', 'maintenance'),
('120', 2, 3, 1120000, 3, 1, 'Phòng Deluxe view nội khu, đang bảo trì thiết bị vệ sinh', 'maintenance'),
('121', 3, 4, 1300000, 4, 2, 'Phòng Family tầng cao, cửa sổ lớn, phù hợp gia đình 4 người', 'available'),
('122', 2, 3, 1090000, 3, 1, 'Phòng Deluxe gần khu thang máy, thuận tiện di chuyển', 'booked'),
('123', 4, 4, 800000, 2, 2, 'Phòng Twin view thành phố, không gian sáng sủa', 'available'),
('124', 1, 5, 990000, 2, 1, 'Phòng Standard tầng cao, yên tĩnh, phù hợp nghỉ dưỡng', 'available'),
('125', 2, 3, 1020000, 3, 1, 'Phòng Deluxe nội thất hiện đại, phù hợp khách công tác dài ngày', 'booked'),
('126', 1, 1, 900000, 2, 1, 'Phòng Standard tầng thấp, hiện đang bảo trì điều hòa', 'maintenance'),
('127', 2, 1, 1070000, 3, 1, 'Phòng Deluxe gần sảnh, thuận tiện cho gia đình có trẻ nhỏ', 'available'),
('128', 4, 1, 760000, 2, 2, 'Phòng Twin tầng thấp, 2 giường đơn, phù hợp khách đi cùng bạn', 'booked'),
('129', 1, 3, 930000, 2, 1, 'Phòng Standard đang bảo trì nội thất và sơn sửa lại tường', 'maintenance'),
('130', 5, 2, 1900000, 2, 1, 'Suite cao cấp nhất tầng, không gian rộng, phòng khách riêng biệt', 'booked');

-- SERVICES
INSERT INTO Services (service_code, name, price, availability, description) VALUES
('SV001', 'Giặt Ủi', 50000, TRUE, 'Dịch vụ giặt và ủi quần áo trong ngày dành cho khách lưu trú'),
('SV002', 'Bữa Sáng Buffet', 120000, TRUE, 'Buffet sáng đa dạng món Á - Âu, phục vụ tại nhà hàng khách sạn'),
('SV003', 'Đưa Đón Sân Bay', 250000, TRUE, 'Dịch vụ xe đưa đón sân bay riêng, đặt trước tại quầy lễ tân'),
('SV004', 'Spa & Massage', 350000, TRUE, 'Liệu trình massage thư giãn và chăm sóc cơ thể tại khu spa'),
('SV005', 'Bữa Tối Buffet', 280000, TRUE, 'Buffet tối với hải sản và món đặc sản địa phương'),
('SV006', 'Mini Bar Trong Phòng', 150000, TRUE, 'Đồ uống và snack trong minibar, tính phí theo lần sử dụng');


-- PROMOTIONS
INSERT INTO Promotions 
(promotion_code, name, discount_value, start_date, end_date, scope, description) 
VALUES
('PROMO10', 'Ưu Đãi Năm Mới 2025', 10.00, '2025-01-01', '2025-02-01', 'invoice', 'Giảm 10% tổng hóa đơn cho tất cả khách lưu trú dịp năm mới'),
('PROMO20', 'Khuyến Mãi Mùa Xuân', 20.00, '2025-03-01', '2025-04-01', 'room', 'Giảm 20% giá phòng cho các đặt phòng trong mùa xuân'),
('PROMO15', 'Ưu Đãi Du Lịch Hè', 15.00, '2025-06-01', '2025-07-01', 'service', 'Giảm 15% cho tất cả dịch vụ spa, giặt ủi và ăn uống trong mùa hè');


-- BOOKINGS
INSERT INTO Bookings (user_id, check_in, check_out, status, total_guests) VALUES
(18, '2025-11-03 00:00:00', '2025-11-06 00:00:00', 'confirmed', 1),
(18, '2025-11-15 00:00:00', '2025-11-19 00:00:00', 'pending', 4),
(3, '2025-11-22 00:00:00', '2025-11-23 00:00:00', 'completed', 4),
(11, '2025-11-05 00:00:00', '2025-11-06 00:00:00', 'confirmed', 1),
(5, '2025-11-13 00:00:00', '2025-11-18 00:00:00', 'completed', 4),
(6, '2025-11-19 00:00:00', '2025-11-20 00:00:00', 'completed', 4),
(17, '2025-11-24 00:00:00', '2025-11-27 00:00:00', 'pending', 4),
(11, '2025-11-16 00:00:00', '2025-11-19 00:00:00', 'confirmed', 3),
(8, '2025-11-01 00:00:00', '2025-11-05 00:00:00', 'completed', 2),
(18, '2025-11-25 00:00:00', '2025-11-26 00:00:00', 'confirmed', 1),
(9, '2025-11-16 00:00:00', '2025-11-18 00:00:00', 'pending', 3),
(5, '2025-11-11 00:00:00', '2025-11-15 00:00:00', 'pending', 4),
(19, '2025-11-20 00:00:00', '2025-11-23 00:00:00', 'confirmed', 3),
(16, '2025-11-13 00:00:00', '2025-11-15 00:00:00', 'completed', 2),
(1, '2025-11-18 00:00:00', '2025-11-19 00:00:00', 'completed', 3),
(7, '2025-11-01 00:00:00', '2025-11-05 00:00:00', 'confirmed', 2),
(15, '2025-11-19 00:00:00', '2025-11-23 00:00:00', 'completed', 1),
(7, '2025-11-07 00:00:00', '2025-11-09 00:00:00', 'confirmed', 1),
(16, '2025-11-24 00:00:00', '2025-11-25 00:00:00', 'confirmed', 1),
(13, '2025-11-05 00:00:00', '2025-11-09 00:00:00', 'completed', 3);

-- BOOKED ROOMS
INSERT INTO Booked_Rooms (booking_id, room_id, price_at_booking) VALUES
(1, 15, 1225000), (2, 22, 817000), (3, 15, 1099000), (4, 12, 744000),
(5, 27, 1353000), (6, 23, 1140000), (7, 11, 1376000), (8, 14, 1433000),
(9, 28, 626000), (10, 24, 1404000), (11, 20, 548000), (12, 6, 786000),
(13, 3, 1151000), (14, 29, 1105000), (15, 19, 991000), (16, 10, 700000),
(17, 19, 808000), (18, 30, 1415000), (19, 28, 594000), (20, 28, 844000);

-- USED SERVICES
INSERT INTO Used_Services (booking_id, service_id, quantity, service_price, service_date) VALUES
(13, 5, 1, 242568, '2025-11-11'), (20, 6, 3, 863025, '2025-11-16'),
(13, 3, 1, 138713, '2025-11-15'), (6, 1, 2, 323654, '2025-11-04'),
(13, 2, 1, 99299, '2025-11-14'), (19, 4, 2, 535474, '2025-11-15'),
(15, 1, 1, 195709, '2025-11-05'), (8, 1, 3, 496290, '2025-11-02'),
(4, 1, 2, 529530, '2025-11-10'), (20, 3, 1, 141536, '2025-11-13'),
(20, 6, 3, 768042, '2025-11-15'), (14, 3, 1, 202164, '2025-11-23'),
(18, 5, 1, 246478, '2025-11-09'), (12, 2, 3, 746400, '2025-11-01'),
(19, 2, 3, 299313, '2025-11-05'), (12, 6, 2, 349176, '2025-11-17'),
(6, 4, 1, 267129, '2025-11-22'), (11, 1, 3, 450864, '2025-11-24'),
(11, 2, 1, 228264, '2025-11-13'), (6, 4, 1, 83124, '2025-11-24'),
(17, 4, 1, 69381, '2025-11-25'), (2, 1, 2, 298822, '2025-11-03'),
(15, 4, 1, 192220, '2025-11-16'), (13, 4, 2, 153792, '2025-11-23'),
(14, 5, 2, 264206, '2025-11-02'), (1, 3, 2, 584056, '2025-11-19'),
(7, 3, 1, 197752, '2025-11-03'), (13, 3, 1, 82571, '2025-11-12'),
(8, 5, 1, 212180, '2025-11-21'), (15, 6, 1, 265094, '2025-11-07');

-- INVOICES
INSERT INTO Invoices (booking_id, staff_id, total_room_cost, total_service_cost, discount_amount, final_amount, vat_amount, promotion_id) VALUES
(1, 2, 500000, 200000, 0, 700000, 70000.0, 2),
(2, 3, 500000, 300000, 0, 800000, 80000.0, 3),
(3, 1, 2000000, 0, 50000, 1950000, 195000.0, 1),
(4, 3, 1000000, 100000, 100000, 1000000, 100000.0, 3),
(5, 2, 500000, 200000, 0, 700000, 70000.0, 2),
(6, 2, 1500000, 300000, 50000, 1750000, 175000.0, 1),
(7, 1, 2000000, 100000, 50000, 2050000, 205000.0, 2),
(8, 3, 2500000, 200000, 0, 2700000, 270000.0, 3),
(9, 2, 2500000, 300000, 100000, 2700000, 270000.0, 3),
(10, 2, 2500000, 200000, 50000, 2650000, 265000.0, 1),
(11, 3, 2000000, 300000, 50000, 2250000, 225000.0, 2),
(12, 3, 1500000, 100000, 100000, 1500000, 150000.0, 1),
(13, 2, 500000, 100000, 50000, 550000, 55000.0, 3),
(14, 3, 500000, 300000, 100000, 700000, 70000.0, 3),
(15, 3, 2000000, 0, 0, 2000000, 200000.0, 3),
(16, 1, 2500000, 300000, 50000, 2750000, 275000.0, 2),
(17, 2, 500000, 100000, 0, 600000, 60000.0, 2),
(18, 2, 1000000, 300000, 100000, 1200000, 120000.0, 2),
(19, 1, 2000000, 300000, 50000, 2250000, 225000.0, 3),
(20, 3, 2000000, 300000, 100000, 2200000, 220000.0, 1);

-- REVIEWS
INSERT INTO Reviews (booking_id, user_id, room_id, rating, comment) VALUES
(1, 7, 9, 5, 'Phòng sạch sẽ, nhân viên thân thiện, mình rất hài lòng'),
(2, 19, 16, 5, 'Suite rộng rãi, minibar đầy đủ, trải nghiệm rất đáng tiền'),
(3, 2, 24, 4, 'Phòng đẹp, view ổn nhưng cách âm chưa thật sự tốt'),
(4, 19, 11, 4, 'Giường ngủ êm, vị trí khách sạn thuận tiện đi lại'),
(5, 1, 3, 3, 'Phòng ổn nhưng điều hòa làm lạnh hơi chậm'),
(6, 5, 15, 5, 'Nhân viên hỗ trợ nhiệt tình, phòng twin rất thoải mái'),
(7, 17, 20, 4, 'Không gian yên tĩnh, phù hợp nghỉ dưỡng cuối tuần'),
(8, 11, 25, 5, 'Buffet sáng ngon, nhiều lựa chọn món ăn'),
(9, 7, 23, 4, 'Phòng sạch, ánh sáng tốt, sẽ quay lại lần sau'),
(10, 19, 28, 5, 'Gia đình mình rất thích phòng family này'),
(11, 8, 11, 5, 'Dịch vụ spa rất thư giãn, đáng để thử'),
(12, 8, 19, 4, 'Phòng ổn, giá hợp lý so với chất lượng'),
(13, 9, 23, 4, 'Nhân viên lễ tân thân thiện và hỗ trợ nhanh chóng'),
(14, 14, 5, 4, 'Phòng deluxe đẹp, nội thất hiện đại'),
(15, 17, 27, 4, 'Không gian thoáng, giường ngủ khá êm'),
(16, 10, 20, 4, 'Khách sạn sạch sẽ, gần trung tâm nên rất tiện'),
(17, 4, 7, 5, 'Rất thích ban công và view buổi tối của phòng'),
(18, 1, 12, 3, 'Phòng ổn nhưng đang bảo trì nên hơi bất tiện'),
(19, 20, 14, 3, 'Dịch vụ tốt nhưng hôm đó wifi hơi chậm'),
(20, 14, 11, 4, 'Trải nghiệm nhìn chung tốt, sẽ giới thiệu cho bạn bè');
