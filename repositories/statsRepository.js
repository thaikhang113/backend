const db = require('../config/db');

const StatsRepository = {
    // Thống kê doanh thu theo ngày/tháng/năm
    getRevenueStats: async (startDate, endDate, type = 'daily') => {
        let dateTrunc;
        if (type === 'monthly') dateTrunc = 'month';
        else if (type === 'yearly') dateTrunc = 'year';
        else dateTrunc = 'day';

        const query = `
            SELECT 
                DATE_TRUNC($1, issue_date) as time_point, 
                SUM(final_amount) as revenue,
                COUNT(invoice_id) as invoice_count
            FROM Invoices
            WHERE issue_date BETWEEN $2 AND $3 
            AND payment_status = 'paid'
            GROUP BY time_point
            ORDER BY time_point ASC;
        `;
        const res = await db.query(query, [dateTrunc, startDate, endDate]);
        return res.rows;
    },

    // Thống kê tỷ lệ phòng được đặt (Occupancy Rate)
    getRoomOccupancy: async (startDate, endDate) => {
        const query = `
            SELECT 
                rt.name as room_type,
                COUNT(br.booked_room_id) as total_bookings,
                SUM(EXTRACT(DAY FROM (b.check_out - b.check_in))) as total_days_occupied
            FROM Room_Types rt
            LEFT JOIN Rooms r ON rt.room_type_id = r.room_type_id
            LEFT JOIN Booked_Rooms br ON r.room_id = br.room_id
            LEFT JOIN Bookings b ON br.booking_id = b.booking_id
            WHERE b.status IN ('confirmed', 'completed')
            AND b.check_in >= $1 AND b.check_out <= $2
            GROUP BY rt.name;
        `;
        const res = await db.query(query, [startDate, endDate]);
        return res.rows;
    },

    // Top dịch vụ được sử dụng nhiều nhất
    getTopServices: async (limit = 5) => {
        const query = `
            SELECT 
                s.name, 
                COUNT(us.used_service_id) as usage_count,
                SUM(us.quantity * us.service_price) as total_revenue
            FROM Services s
            JOIN Used_Services us ON s.service_id = us.service_id
            GROUP BY s.service_id, s.name
            ORDER BY usage_count DESC
            LIMIT $1;
        `;
        const res = await db.query(query, [limit]);
        return res.rows;
    },

    // Tổng quan Dashboard (Số khách, Doanh thu hôm nay, Phòng trống)
    getDashboardSummary: async () => {
        const today = new Date().toISOString().split('T')[0];
        
        const revenueQuery = `SELECT SUM(final_amount) as revenue FROM Invoices WHERE issue_date = $1 AND payment_status = 'paid'`;
        const guestsQuery = `SELECT SUM(total_guests) as guests FROM Bookings WHERE check_in <= NOW() AND check_out >= NOW() AND status IN ('confirmed', 'checked_in')`;
        const availableRoomsQuery = `SELECT COUNT(*) as count FROM Rooms WHERE status = 'available' AND is_active = TRUE`;
        const pendingBookingsQuery = `SELECT COUNT(*) as count FROM Bookings WHERE status = 'pending'`;

        const [revenueRes, guestsRes, roomsRes, pendingRes] = await Promise.all([
            db.query(revenueQuery, [today]),
            db.query(guestsQuery),
            db.query(availableRoomsQuery),
            db.query(pendingBookingsQuery)
        ]);

        return {
            today_revenue: revenueRes.rows[0].revenue || 0,
            current_guests: guestsRes.rows[0].guests || 0,
            available_rooms: roomsRes.rows[0].count || 0,
            pending_bookings: pendingRes.rows[0].count || 0
        };
    }
};

module.exports = StatsRepository;