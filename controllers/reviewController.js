const db = require('../config/db');

const ReviewController = {
    getReviews: async (req, res) => {
        try {
            const result = await db.query(`
                SELECT r.*, u.username 
                FROM Reviews r
                JOIN Users u ON r.user_id = u.user_id
                ORDER BY r.created_at DESC
            `);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getReviewById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM Reviews WHERE review_id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Review not found' });
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    addReview: async (req, res) => {
        const { booking_id, user_id, room_id, rating, comment } = req.body;
        if (!booking_id || !rating) return res.status(400).json({ message: 'Thiếu booking_id hoặc rating' });

        try {
            const result = await db.query(
                'INSERT INTO Reviews (booking_id, user_id, room_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [booking_id, user_id, room_id, rating, comment]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            if (err.code === '23503') return res.status(400).json({ message: 'Dữ liệu Booking/User/Room không tồn tại!' });
            res.status(500).json({ error: err.message });
        }
    },

    updateReview: async (req, res) => {
        const { id } = req.params;
        const { rating, comment } = req.body;
        try {
            const result = await db.query(
                'UPDATE Reviews SET rating = $1, comment = $2 WHERE review_id = $3 RETURNING *',
                [rating, comment, id]
            );
            if (result.rows.length === 0) return res.status(404).json({ message: 'Review not found' });
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteReview: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query('DELETE FROM Reviews WHERE review_id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Review not found' });
            res.json({ message: 'Review deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ReviewController;