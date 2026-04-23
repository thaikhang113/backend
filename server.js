const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');

// Import Routes
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customers');
const serviceRoutes = require('./routes/services');
const roomRoutes = require('./routes/rooms');
const roomTypeRoutes = require('./routes/roomTypes');
const bookingRoutes = require('./routes/bookings');
const invoiceRoutes = require('./routes/invoices');
const reviewRoutes = require('./routes/reviews');
const reportRoutes = require('./routes/reports');
const promotionRoutes = require('./routes/promotions');

// Import Scheduler
require('./utils/scheduler'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Hotel Management API', status: 'Running' });
});

// API Routes mapping
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/promotions', promotionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            status: 'error',
            message: 'Uploaded file is too large',
            error: err.message
        });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid upload request',
            error: err.message
        });
    }

    console.error(err.stack);
    res.status(500).json({ 
        status: 'error', 
        message: 'Internal Server Error', 
        error: err.message 
    });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
