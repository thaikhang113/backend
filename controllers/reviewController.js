const db = require('../config/db');

const getReviews = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Reviews ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addReview = async (req, res) => {
    const { user_id, room_id, rating, comment } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Reviews (user_id, room_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, room_id, rating, comment]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getReviews, addReview };