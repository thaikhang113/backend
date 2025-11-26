const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookingDetails);
router.get('/:id', bookingController.getBookingDetails);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
router.post('/:id/services', bookingController.addService);
router.post('/:id/checkout', bookingController.checkout);

module.exports = router;