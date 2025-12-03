const Invoice = require('../models/invoice');
const Booking = require('../models/booking');
const Service = require('../models/service');
const Promotion = require('../models/promotion');
const InvoiceRepository = require('../repositories/invoiceRepository');
const { sendInvoiceEmail } = require('../utils/email');

const InvoiceService = {
    // Thêm tham số client
    calculateTotal: async (bookingId, promoCode, client = null) => {
        const booking = await Booking.getById(bookingId, client);
        if (!booking) throw new Error("Booking not found when calculating invoice");
        
        const bookedRooms = await Booking.getBookedRooms(bookingId, client);
        const usedServices = await Service.getUsedByBooking(bookingId, client);

        // Calculate Room Cost
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
        
        let totalRoomCost = 0;
        bookedRooms.forEach(room => {
            totalRoomCost += parseFloat(room.price_at_booking) * nights;
        });

        // Calculate Service Cost
        let totalServiceCost = 0;
        usedServices.forEach(s => {
            totalServiceCost += parseFloat(s.service_price) * s.quantity;
        });

        let totalAmount = totalRoomCost + totalServiceCost;
        let discountAmount = 0;
        let promotionId = null;

        // Apply Promotion
        if (promoCode) {
            const promo = await Promotion.findByCode(promoCode, client);
            if (promo) {
                if (promo.usage_limit > promo.used_count) {
                    promotionId = promo.promotion_id;
                    if (promo.scope === 'invoice') {
                        discountAmount = (totalAmount * promo.discount_value) / 100;
                    } else if (promo.scope === 'room') {
                        discountAmount = (totalRoomCost * promo.discount_value) / 100;
                    } else if (promo.scope === 'service') {
                        discountAmount = (totalServiceCost * promo.discount_value) / 100;
                    }
                } else {
                    throw new Error("Mã giảm giá đã hết lượt sử dụng");
                }
            } else {
                 throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
            }
        }

        const finalAmount = totalAmount - discountAmount;
        const vatAmount = finalAmount * 0.1; // 10% VAT
        const finalTotal = finalAmount + vatAmount;

        return {
            totalRoomCost,
            totalServiceCost,
            discountAmount,
            vatAmount,
            finalTotal,
            promotionId,
            nights
        };
    },

    createInvoice: async (staffId, bookingId, promoCode, client = null) => {
        const calculation = await InvoiceService.calculateTotal(bookingId, promoCode, client);
        
        const newInvoice = await Invoice.create({
            booking_id: bookingId,
            staff_id: staffId,
            total_room: calculation.totalRoomCost,
            total_service: calculation.totalServiceCost,
            discount: calculation.discountAmount,
            final_total: calculation.finalTotal,
            promo_id: calculation.promotionId
        }, client);

        if (calculation.promotionId) {
            await Promotion.incrementUsage(calculation.promotionId, client);
        }

        // Send email asynchronously (Chỉ gửi khi transaction thành công, nhưng ở đây gửi luôn cũng được vì try/catch ở controller)
        // Lưu ý: InvoiceRepository dùng db mặc định, có thể không thấy dữ liệu trong transaction.
        // Nên chỉ gửi email SAU KHI commit transaction ở controller nếu muốn chắc chắn.
        // Tạm thời để ở đây nhưng bọc trong setImmediate để không block
        if (!client) { // Chỉ gửi email nếu không trong transaction, hoặc xử lý sau
             const invoiceDetail = await InvoiceRepository.getInvoiceDetailFull(newInvoice.invoice_id);
             if (invoiceDetail && invoiceDetail.info.email) {
                 sendInvoiceEmail(invoiceDetail.info.email, newInvoice).catch(console.error);
             }
        }

        return newInvoice;
    }
};

module.exports = InvoiceService;