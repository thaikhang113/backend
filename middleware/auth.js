const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Missing User ID' });
        }

        const result = await db.query('SELECT * FROM Users WHERE user_id = $1 AND is_active = TRUE', [userId]);

        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Invalid User' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Auth Error', error: error.message });
    }
};

const adminGuard = (req, res, next) => {
    if (req.user && req.user.is_staff) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin/Staff access required' });
    }
};

module.exports = { authMiddleware, adminGuard };