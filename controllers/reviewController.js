const db = require('../config/db');

const getReviews = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Reviews ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getReviewById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Reviews WHERE review_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Review not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addReview = async (req, res) => {
    const { user_id, room_id, booking_id, rating, comment } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Reviews (user_id, room_id, booking_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, room_id, booking_id, rating, comment]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    try {
        const review = await db.query('SELECT * FROM Reviews WHERE review_id = $1', [id]);
        if (review.rows.length === 0) return res.status(404).json({ message: 'Review not found' });

        if (!req.user.is_staff && review.rows[0].user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const result = await db.query(
            'UPDATE Reviews SET rating = $1, comment = $2 WHERE review_id = $3 RETURNING *',
            [rating, comment, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        const review = await db.query('SELECT * FROM Reviews WHERE review_id = $1', [id]);
        if (review.rows.length === 0) return res.status(404).json({ message: 'Review not found' });

        if (!req.user.is_staff && review.rows[0].user_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await db.query('DELETE FROM Reviews WHERE review_id = $1', [id]);
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getReviews, getReviewById, addReview, updateReview, deleteReview };