const db = require('../config/db');

const Promotion = {
    findByCode: async (code) => {
        const res = await db.query(
            'SELECT * FROM Promotions WHERE promotion_code = $1 AND is_active = TRUE AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE',
            [code]
        );
        return res.rows[0];
    },

    incrementUsage: async (id) => {
        await db.query('UPDATE Promotions SET used_count = used_count + 1 WHERE promotion_id = $1', [id]);
    }
};

module.exports = Promotion;