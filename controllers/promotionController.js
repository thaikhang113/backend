const db = require('../config/db');

const getAllPromotions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Promotions');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPromotionById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Promotions WHERE promotion_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Promotion not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createPromotion = async (req, res) => {
    const { promotion_code, name, discount_value, start_date, end_date, scope, description, is_active } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Promotions (promotion_code, name, discount_value, start_date, end_date, scope, description, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [promotion_code, name, discount_value, start_date, end_date, scope, description, is_active || true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePromotion = async (req, res) => {
    const { id } = req.params;
    const { name, discount_value, start_date, end_date, scope, description, is_active } = req.body;
    try {
        const result = await db.query(
            'UPDATE Promotions SET name=$1, discount_value=$2, start_date=$3, end_date=$4, scope=$5, description=$6, is_active=$7 WHERE promotion_id=$8 RETURNING *',
            [name, discount_value, start_date, end_date, scope, description, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Promotion not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deletePromotion = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Promotions WHERE promotion_id = $1 RETURNING promotion_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Promotion not found' });
        res.json({ message: 'Promotion deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllPromotions, getPromotionById, createPromotion, updatePromotion, deletePromotion };