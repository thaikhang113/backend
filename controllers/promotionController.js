const db = require('../config/db');

const PromotionController = {
    getAllPromotions: async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM Promotions ORDER BY promotion_id ASC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPromotionById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM Promotions WHERE promotion_id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Promotion not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createPromotion: async (req, res) => {
        const { promotion_code, name, discount_value, start_date, end_date, usage_limit, scope, description } = req.body;
        if (!promotion_code || !name || !discount_value || !start_date || !end_date) {
            return res.status(400).json({ message: 'Code, name, discount, start date, and end date are required.' });
        }

        try {
            const result = await db.query(
                `INSERT INTO Promotions 
                (promotion_code, name, discount_value, start_date, end_date, usage_limit, scope, description, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE) 
                RETURNING *`,
                [promotion_code, name, discount_value, start_date, end_date, usage_limit || 100, scope || 'invoice', description]
            );

            res.status(201).json({ message: 'Promotion created successfully', promotion: result.rows[0] });
        } catch (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'Promotion code already exists.' });
            res.status(500).json({ error: error.message });
        }
    },

    updatePromotion: async (req, res) => {
        const { id } = req.params;
        const body = req.body;

        try {
            const existingResult = await db.query('SELECT promotion_code, name, discount_value, start_date, end_date, usage_limit, scope, description, is_active FROM Promotions WHERE promotion_id = $1', [id]);
            if (existingResult.rows.length === 0) return res.status(404).json({ message: 'Promotion not found' });
            const existing = existingResult.rows[0];

            const name = body.name !== undefined ? body.name : existing.name;
            const discount_value = body.discount_value !== undefined ? body.discount_value : existing.discount_value;
            const start_date = body.start_date !== undefined ? body.start_date : existing.start_date;
            const end_date = body.end_date !== undefined ? body.end_date : existing.end_date;
            const usage_limit = body.usage_limit !== undefined ? body.usage_limit : existing.usage_limit;
            const scope = body.scope !== undefined ? body.scope : existing.scope;
            const description = body.description !== undefined ? body.description : existing.description;
            const is_active = body.is_active !== undefined ? body.is_active : existing.is_active;

            if (!name || !discount_value || !start_date || !end_date) {
                 return res.status(400).json({ error: 'Name, discount, start date, and end date cannot be null.' });
            }

            const result = await db.query(
                `UPDATE Promotions 
                 SET name = $1, discount_value = $2, start_date = $3, end_date = $4, usage_limit = $5, scope = $6, description = $7, is_active = $8
                 WHERE promotion_id = $9 RETURNING *`,
                [name, discount_value, start_date, end_date, usage_limit, scope, description, is_active, id]
            );

            res.json({ message: 'Promotion updated successfully', promotion: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deletePromotion: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query(
                'UPDATE Promotions SET is_active = FALSE WHERE promotion_id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) return res.status(404).json({ message: 'Promotion not found' });
            res.json({ message: 'Promotion deactivated successfully (Soft Delete)' });
        } catch (error) {
            if (error.code === '23503') {
                 return res.status(400).json({ error: 'Cannot delete: Invoices are using this promotion. Promotion set to inactive.' });
            }
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = PromotionController;