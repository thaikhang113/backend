-- ============================================
-- DATABASE: Hotel Management System (NO AUTH/OTP)
-- ============================================

DROP TABLE IF EXISTS Room_Status_History, Reviews, Invoices, Used_Services, Services, Booked_Rooms, Bookings, Rooms, Room_Types, Promotions, Reports, Users;

-- ==========================
-- TẠO BẢNG (SCHEMA)
-- ==========================

-- TABLE: Users (Đã xóa cột OTP)
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL, -- Lưu plain text
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
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP
);

-- TABLE: Room_Types
CREATE TABLE Room_Types (
    room_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- TABLE: Rooms
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
    is_active BOOLEAN DEFAULT TRUE
);

-- TABLE: Services
CREATE TABLE Services (
    service_id SERIAL PRIMARY KEY,
    service_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- TABLE: Promotions
CREATE TABLE Promotions (
    promotion_id SERIAL PRIMARY KEY,
    promotion_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    discount_value DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    scope VARCHAR(20) DEFAULT 'invoice',
    description TEXT,
    usage_limit INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0
);

-- TABLE: Reports
CREATE TABLE Reports (
    report_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, 
    start_date DATE,
    end_date DATE,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    generated_content TEXT, 
    created_by INTEGER REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Bookings
CREATE TABLE Bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    total_guests INTEGER
);

-- TABLE: Booked_Rooms
CREATE TABLE Booked_Rooms (
    booked_room_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES Bookings(booking_id),
    room_id INTEGER REFERENCES Rooms(room_id),
    price_at_booking DECIMAL(10,2)
);

-- TABLE: Used_Services
CREATE TABLE Used_Services (
    used_service_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES Bookings(booking_id),
    service_id INTEGER REFERENCES Services(service_id),
    room_id INTEGER REFERENCES Rooms(room_id),
    quantity INTEGER DEFAULT 1,
    service_price DECIMAL(10,2),
    service_date TIMESTAMP
);

-- TABLE: Invoices
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

-- TABLE: Reviews
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES Bookings(booking_id),
    user_id INTEGER REFERENCES Users(user_id),
    room_id INTEGER REFERENCES Rooms(room_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Room_Status_History
CREATE TABLE Room_Status_History (
    history_id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES Rooms(room_id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INTEGER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- THÊM DỮ LIỆU MẪU (DATA INSERTION)
-- ============================================

-- USERS (Đã xóa cột OTP)
INSERT INTO Users (password_hash, username, email, first_name, last_name, gender, phone_number, address, date_of_birth, is_staff) VALUES
('hash1', 'user1', 'user1@mail.com', 'First1', 'Last1', 'Female', '0900000001', 'City1', '1993-09-11', TRUE),
('hash2', 'user2', 'user2@mail.com', 'First2', 'Last2', 'Male', '0900000002', 'City2', '1998-03-21', TRUE),
('hash3', 'user3', 'user3@mail.com', 'First3', 'Last3', 'Female', '0900000003', 'City3', '1991-07-19', FALSE),
('hash4', 'user4', 'user4@mail.com', 'First4', 'Last4', 'Male', '0900000004', 'City4', '1993-08-26', FALSE),
('hash5', 'user5', 'user5@mail.com', 'First5', 'Last5', 'Female', '0900000005', 'City5', '1997-02-17', FALSE),
('hash6', 'user6', 'user6@mail.com', 'First6', 'Last6', 'Male', '0900000006', 'City6', '1990-08-28', TRUE),
('hash7', 'user7', 'user7@mail.com', 'First7', 'Last7', 'Female', '0900000007', 'City7', '1996-08-19', FALSE),
('hash8', 'user8', 'user8@mail.com', 'First8', 'Last8', 'Male', '0900000008', 'City8', '1991-03-16', FALSE),
('hash9', 'user9', 'user9@mail.com', 'First9', 'Last9', 'Female', '0900000009', 'City9', '1990-02-15', FALSE),
('hash10', 'user10', 'user10@mail.com', 'First10', 'Last10', 'Male', '0900000010', 'City10', '1990-07-13', TRUE),
('hash11', 'user11', 'user11@mail.com', 'First11', 'Last11', 'Female', '0900000011', 'City11', '1999-02-25', TRUE),
('hash12', 'user12', 'user12@mail.com', 'First12', 'Last12', 'Male', '0900000012', 'City12', '1991-05-15', TRUE),
('hash13', 'user13', 'user13@mail.com', 'First13', 'Last13', 'Female', '0900000013', 'City13', '1998-07-21', FALSE),
('hash14', 'user14', 'user14@mail.com', 'First14', 'Last14', 'Male', '0900000014', 'City14', '1994-04-27', FALSE),
('hash15', 'user15', 'user15@mail.com', 'First15', 'Last15', 'Female', '0900000015', 'City15', '1998-08-22', FALSE),
('hash16', 'user16', 'user16@mail.com', 'First16', 'Last16', 'Male', '0900000016', 'City16', '1996-07-27', FALSE),
('hash17', 'user17', 'user17@mail.com', 'First17', 'Last17', 'Female', '0900000017', 'City17', '1995-04-14', TRUE),
('hash18', 'user18', 'user18@mail.com', 'First18', 'Last18', 'Male', '0900000018', 'City18', '1997-07-20', TRUE),
('hash19', 'user19', 'user19@mail.com', 'First19', 'Last19', 'Female', '0900000019', 'City19', '1991-05-22', TRUE),
('hash20', 'user20', 'user20@mail.com', 'First20', 'Last20', 'Male', '0900000020', 'City20', '1997-05-17', TRUE);

-- Admin hệ thống
INSERT INTO Users (password_hash, username, email, first_name, last_name, is_staff) 
VALUES ('admin123', 'admin_system', 'admin@hotel.com', 'Admin', 'System', TRUE)
ON CONFLICT (username) DO NOTHING;

-- ROOM TYPES
INSERT INTO Room_Types (name, description) VALUES
('Standard', 'Basic room with one bed'),
('Deluxe', 'Spacious room with city view'),
('Suite', 'Luxury room with living area and kitchen'),
('Family', 'Large room for family stay'),
('Business', 'Room with working desk and Wi-Fi');

-- ROOMS
INSERT INTO Rooms (room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status) VALUES
('101', 4, 4, 580000, 2, 2, 'Room description 1', 'booked'),
('102', 1, 3, 1498000, 3, 2, 'Room description 2', 'available'),
('103', 3, 1, 812000, 3, 3, 'Room description 3', 'booked'),
('104', 2, 3, 623000, 5, 2, 'Room description 4', 'available'),
('105', 2, 3, 1385000, 3, 2, 'Room description 5', 'maintenance'),
('106', 3, 5, 539000, 2, 1, 'Room description 6', 'booked'),
('107', 3, 4, 1011000, 4, 3, 'Room description 7', 'available'),
('108', 1, 4, 1418000, 3, 3, 'Room description 8', 'booked'),
('109', 5, 2, 694000, 2, 1, 'Room description 9', 'booked'),
('110', 5, 2, 905000, 2, 2, 'Room description 10', 'booked'),
('111', 4, 5, 888000, 2, 3, 'Room description 11', 'booked'),
('112', 2, 5, 1370000, 2, 3, 'Room description 12', 'maintenance'),
('113', 3, 2, 1441000, 2, 1, 'Room description 13', 'maintenance'),
('114', 5, 2, 1152000, 2, 1, 'Room description 14', 'booked'),
('115', 4, 3, 496000, 4, 2, 'Room description 15', 'booked'),
('116', 5, 2, 421000, 2, 1, 'Room description 16', 'available'),
('117', 1, 3, 1089000, 3, 3, 'Room description 17', 'booked'),
('118', 2, 1, 1289000, 5, 1, 'Room description 18', 'maintenance'),
('119', 3, 3, 659000, 2, 2, 'Room description 19', 'maintenance'),
('120', 2, 3, 1321000, 5, 3, 'Room description 20', 'maintenance'),
('121', 3, 4, 921000, 4, 2, 'Room description 21', 'available'),
('122', 2, 3, 907000, 4, 2, 'Room description 22', 'booked'),
('123', 4, 4, 848000, 4, 3, 'Room description 23', 'available'),
('124', 1, 5, 1498000, 4, 3, 'Room description 24', 'available'),
('125', 2, 3, 406000, 4, 2, 'Room description 25', 'booked'),
('126', 1, 1, 1270000, 5, 1, 'Room description 26', 'maintenance'),
('127', 2, 1, 861000, 3, 3, 'Room description 27', 'available'),
('128', 4, 1, 424000, 4, 2, 'Room description 28', 'booked'),
('129', 1, 3, 815000, 3, 3, 'Room description 29', 'maintenance'),
('130', 5, 2, 1432000, 4, 2, 'Room description 30', 'booked');

-- SERVICES
INSERT INTO Services (service_code, name, price, availability, description) VALUES
('SV001', 'Laundry', 50000, TRUE, 'Laundry and ironing service'),
('SV002', 'Breakfast', 100000, TRUE, 'Buffet breakfast'),
('SV003', 'Airport Pickup', 200000, TRUE, 'Pickup from airport'),
('SV004', 'Spa', 300000, TRUE, 'Relaxing massage and spa'),
('SV005', 'Dinner', 250000, TRUE, 'Dinner buffet at restaurant'),
('SV006', 'Mini Bar', 150000, TRUE, 'In-room mini bar'),
('SV007', 'Extra Bed', 200000, TRUE, 'Additional bed for extra guest'),
('SV008', 'Tour Guide', 500000, TRUE, 'Daily city tour guide');

-- PROMOTIONS
INSERT INTO Promotions (promotion_code, name, discount_value, start_date, end_date, scope, description, usage_limit, used_count) VALUES
('PROMO10', 'New Year Discount', 10.00, '2025-01-01', '2025-02-01', 'invoice', '10% off total invoice', 50, 5),
('PROMO20', 'Room Discount', 20.00, '2025-03-01', '2025-04-01', 'room', '20% off room price', 20, 10),
('PROMO30', 'Summer Offer', 15.00, '2025-06-01', '2025-07-01', 'service', '15% off all services', 100, 0);

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
INSERT INTO Invoices (booking_id, staff_id, total_room_cost, total_service_cost, discount_amount, final_amount, vat_amount, promotion_id, payment_status) VALUES
(1, 2, 500000, 200000, 0, 700000, 70000.0, 2, 'paid'),
(2, 3, 500000, 300000, 0, 800000, 80000.0, 3, 'paid'),
(3, 1, 2000000, 0, 50000, 1950000, 195000.0, 1, 'paid'),
(4, 3, 1000000, 100000, 100000, 1000000, 100000.0, 3, 'paid'),
(5, 2, 500000, 200000, 0, 700000, 70000.0, 2, 'paid'),
(6, 2, 1500000, 300000, 50000, 1750000, 175000.0, 1, 'paid'),
(7, 1, 2000000, 100000, 50000, 2050000, 205000.0, 2, 'paid'),
(8, 3, 2500000, 200000, 0, 2700000, 270000.0, 3, 'paid'),
(9, 2, 2500000, 300000, 100000, 2700000, 270000.0, 3, 'paid'),
(10, 2, 2500000, 200000, 50000, 2650000, 265000.0, 1, 'paid'),
(11, 3, 2000000, 300000, 50000, 2250000, 225000.0, 2, 'paid'),
(12, 3, 1500000, 100000, 100000, 1500000, 150000.0, 1, 'paid'),
(13, 2, 500000, 100000, 50000, 550000, 55000.0, 3, 'paid'),
(14, 3, 500000, 300000, 100000, 700000, 70000.0, 3, 'paid'),
(15, 3, 2000000, 0, 0, 2000000, 200000.0, 3, 'paid'),
(16, 1, 2500000, 300000, 50000, 2750000, 275000.0, 2, 'paid'),
(17, 2, 500000, 100000, 0, 600000, 60000.0, 2, 'paid'),
(18, 2, 1000000, 300000, 100000, 1200000, 120000.0, 2, 'paid'),
(19, 1, 2000000, 300000, 50000, 2250000, 225000.0, 3, 'paid'),
(20, 3, 2000000, 300000, 100000, 2200000, 220000.0, 1, 'paid');

-- REVIEWS
INSERT INTO Reviews (booking_id, user_id, room_id, rating, comment) VALUES
(1, 7, 9, 5, 'Great stay 1'), (2, 19, 16, 5, 'Great stay 2'),
(3, 2, 24, 4, 'Great stay 3'), (4, 19, 11, 4, 'Great stay 4'),
(5, 1, 3, 3, 'Great stay 5'), (6, 5, 15, 5, 'Great stay 6'),
(7, 17, 20, 4, 'Great stay 7'), (8, 11, 25, 5, 'Great stay 8'),
(9, 7, 23, 4, 'Great stay 9'), (10, 19, 28, 5, 'Great stay 10'),
(11, 8, 11, 5, 'Great stay 11'), (12, 8, 19, 4, 'Great stay 12'),
(13, 9, 23, 4, 'Great stay 13'), (14, 14, 5, 4, 'Great stay 14'),
(15, 17, 27, 4, 'Great stay 15'), (16, 10, 20, 4, 'Great stay 16'),
(17, 4, 7, 5, 'Great stay 17'), (18, 1, 12, 3, 'Great stay 18'),
(19, 20, 14, 3, 'Great stay 19'), (20, 14, 11, 4, 'Great stay 20');

-- REPORTS
INSERT INTO Reports (title, report_type, start_date, end_date, total_revenue, generated_content, created_by) VALUES
('Monthly Revenue Report - October 2025', 'revenue', '2025-10-01', '2025-10-31', 150000000, '{"room_revenue": 120000000, "service_revenue": 30000000}', 1),
('Service Usage Report - Q3 2025', 'service_usage', '2025-07-01', '2025-09-30', 45000000, '{"top_service": "Spa", "least_service": "Laundry"}', 2);