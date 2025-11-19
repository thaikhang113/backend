// Sử dụng setInterval thay vì node-cron để hạn chế dependency
const db = require('../config/db');

// Chạy mỗi 1 giờ để kiểm tra
const CHECK_INTERVAL = 60 * 60 * 1000; 

const runScheduler = () => {
    console.log('[Scheduler] Job started...');
    
    setInterval(async () => {
        try {
            console.log('[Scheduler] Checking for upcoming check-ins...');
            
            // Ví dụ: Tìm booking sẽ check-in ngày mai để gửi nhắc nhở
            const query = `
                SELECT b.booking_id, u.email, u.first_name 
                FROM Bookings b
                JOIN Users u ON b.user_id = u.user_id
                WHERE b.check_in = CURRENT_DATE + INTERVAL '1 day'
                AND b.status = 'confirmed'
            `;
            
            const { rows } = await db.query(query);
            
            rows.forEach(booking => {
                console.log(`[Scheduler] Reminding user ${booking.email} for booking ${booking.booking_id}`);
                // Gọi hàm sendEmail(booking.email, ...) ở đây
            });

        } catch (error) {
            console.error('[Scheduler] Error:', error);
        }
    }, CHECK_INTERVAL);
};

// Khởi động scheduler
runScheduler();

module.exports = runScheduler;