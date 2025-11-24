const Booking = require('../models/booking');
const Room = require('../models/room');
const BookingRepository = require('../repositories/bookingRepository');
const Service = require('../models/service');

const BookingService = {
    checkAvailability: async (roomTypeId, checkIn, checkOut) => {
        return await BookingRepository.findAvailableRoomsByType(roomTypeId, checkIn, checkOut);
    },

    createBooking: async (userId, bookingData) => {
        const { room_ids, check_in, check_out, total_guests } = bookingData;

        // 1. Validate availability for all rooms
        for (const roomId of room_ids) {
            const isAvailable = await BookingRepository.isRoomAvailable(roomId, check_in, check_out);
            if (!isAvailable) {
                throw new Error(`Phòng ${roomId} không còn trống trong khoảng thời gian này`);
            }
        }

        // 2. Create Booking Record
        const newBooking = await Booking.create({ 
            user_id: userId, 
            check_in, 
            check_out, 
            total_guests 
        });

        // 3. Add Rooms to Booking and Update Room Status
        for (const roomId of room_ids) {
            const room = await Room.getById(roomId);
            await Booking.addRoom(newBooking.booking_id, roomId, room.price_per_night);
            await Room.updateStatus(roomId, 'booked');
        }

        return newBooking;
    },

    addServiceToRoom: async (bookingId, serviceCode, quantity, roomId) => {
        const services = await Service.getAll();
        const selectedService = services.find(s => s.service_code === serviceCode);
        
        if (!selectedService) throw new Error('Dịch vụ không tồn tại');

        return await Service.addUsedService({
            booking_id: bookingId,
            service_id: selectedService.service_id,
            quantity: quantity,
            price: selectedService.price,
            room_id: roomId || null
        });
    },

    checkOut: async (bookingId) => {
        const booking = await Booking.getById(bookingId);
        if (!booking) throw new Error('Booking not found');

        // Update booking status
        await Booking.updateStatus(bookingId, 'completed');

        // Release rooms
        const bookedRooms = await Booking.getBookedRooms(bookingId);
        for (const room of bookedRooms) {
            await Room.updateStatus(room.room_id, 'cleanup'); // Set to cleanup before available
        }

        return true;
    }
};

module.exports = BookingService;