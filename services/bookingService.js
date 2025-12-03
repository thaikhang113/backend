const Booking = require('../models/booking');
const Room = require('../models/room');
const BookingRepository = require('../repositories/bookingRepository');
const Service = require('../models/service');

const BookingService = {
    checkAvailability: async (roomTypeId, checkIn, checkOut) => {
        return await BookingRepository.findAvailableRoomsByType(roomTypeId, checkIn, checkOut);
    },

    // Thêm tham số client để hỗ trợ transaction
    createBooking: async (userId, bookingData, client = null) => {
        const { room_ids, check_in, check_out, total_guests, services } = bookingData;

        for (const roomId of room_ids) {
            // Truyền client vào Repository
            const isAvailable = await BookingRepository.isRoomAvailable(roomId, check_in, check_out, client);
            if (!isAvailable) {
                throw new Error(`Phòng ${roomId} không còn trống trong khoảng thời gian này`);
            }
        }

        const newBooking = await Booking.create({ 
            user_id: userId, 
            check_in, 
            check_out, 
            total_guests 
        }, client);

        for (const roomId of room_ids) {
            const room = await Room.getById(roomId, client);
            await Booking.addRoom(newBooking.booking_id, roomId, room.price_per_night, client);
            await Room.updateStatus(roomId, 'booked', client);
        }

        if (services && Array.isArray(services) && services.length > 0) {
            const allServices = await Service.getAll(client);
            
            for (const item of services) {
                const selectedService = allServices.find(s => s.service_code === item.serviceCode);
                if (selectedService) {
                    await Service.addUsedService({
                        booking_id: newBooking.booking_id,
                        service_id: selectedService.service_id,
                        quantity: item.quantity || 1,
                        price: selectedService.price,
                        room_id: item.roomId || null 
                    }, client);
                }
            }
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

        await Booking.updateStatus(bookingId, 'completed');

        const bookedRooms = await Booking.getBookedRooms(bookingId);
        for (const room of bookedRooms) {
            await Room.updateStatus(room.room_id, 'cleanup');
        }

        return true;
    }
};

module.exports = BookingService;