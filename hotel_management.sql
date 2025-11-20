
-- ============================================
-- DATABASE: Hotel Management System
-- Author: ChatGPT GPT-5
-- ============================================

-- Drop existing tables if needed (for clean import)
DROP TABLE IF EXISTS Reviews, Invoices, Used_Services, Services, Booked_Rooms, Bookings, Rooms, Room_Types, Promotions, Users CASCADE;

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
    status VARCHAR(20) DEFAULT 'available'
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
    total_guests INTEGER
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
    promotion_id INTEGER REFERENCES Promotions(promotion_id)
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

-- =========================================
-- INSERT SAMPLE DATA (20 records total)
-- =========================================

-- Users
INSERT INTO Users (password_hash, username, email, first_name, last_name, gender, phone_number, address, date_of_birth, is_staff)
VALUES
('hash123', 'alice', 'alice@mail.com', 'Alice', 'Nguyen', 'Female', '0123456789', 'Hanoi', '1995-02-10', FALSE),
('hash456', 'bob', 'bob@mail.com', 'Bob', 'Tran', 'Male', '0987654321', 'Saigon', '1992-08-20', FALSE),
('hash789', 'staff1', 'staff1@mail.com', 'Linh', 'Pham', 'Female', '0112233445', 'Danang', '1988-05-11', TRUE);

-- Room Types
INSERT INTO Room_Types (name, description) VALUES
('Standard', 'Basic room with one bed'),
('Deluxe', 'Spacious room with city view'),
('Suite', 'Luxury room with living area and kitchen');

-- Rooms
INSERT INTO Rooms (room_number, room_type_id, floor, price_per_night, max_guests, bed_count, description, status)
VALUES
('101', 1, 1, 500000, 2, 1, 'Cozy standard room', 'available'),
('102', 2, 1, 800000, 3, 2, 'Deluxe room with balcony', 'booked'),
('201', 3, 2, 1200000, 4, 2, 'Suite with full amenities', 'available');

-- Services
INSERT INTO Services (service_code, name, price, availability, description) VALUES
('SV001', 'Laundry', 50000, TRUE, 'Laundry and ironing service'),
('SV002', 'Breakfast', 100000, TRUE, 'Buffet breakfast'),
('SV003', 'Airport Pickup', 200000, TRUE, 'Pickup service from airport');

-- Promotions
INSERT INTO Promotions (promotion_code, name, discount_value, start_date, end_date, scope, description) VALUES
('PROMO10', 'New Year Discount', 10.00, '2025-01-01', '2025-02-01', 'invoice', '10% off total invoice'),
('PROMO20', 'Room Discount', 20.00, '2025-03-01', '2025-04-01', 'room', '20% off room price');

-- Bookings
INSERT INTO Bookings (user_id, check_in, check_out, status, total_guests) VALUES
(1, '2025-11-10', '2025-11-12', 'confirmed', 2),
(2, '2025-11-15', '2025-11-20', 'pending', 3);

-- Booked Rooms
INSERT INTO Booked_Rooms (booking_id, room_id, price_at_booking) VALUES
(1, 1, 500000),
(2, 2, 800000);

-- Used Services
INSERT INTO Used_Services (booking_id, service_id, quantity, service_price, service_date) VALUES
(1, 1, 2, 50000, '2025-11-10'),
(1, 2, 1, 100000, '2025-11-11'),
(2, 3, 1, 200000, '2025-11-16');

-- Invoices
INSERT INTO Invoices (booking_id, staff_id, total_room_cost, total_service_cost, discount_amount, final_amount, vat_amount, promotion_id)
VALUES
(1, 3, 1000000, 200000, 100000, 1100000, 100000, 1),
(2, 3, 4000000, 200000, 0, 4200000, 400000, 2);

-- Reviews
INSERT INTO Reviews (booking_id, user_id, room_id, rating, comment) VALUES
(1, 1, 1, 5, 'Very clean and comfortable'),
(2, 2, 2, 4, 'Nice stay, good service');
