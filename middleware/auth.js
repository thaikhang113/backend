const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Missing User ID' });
        }

        const result = await db.query('SELECT * FROM Users WHERE user_id = $1 ', [userId]);

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
    // Disabled strict permission check as per requirement.
    // We still keep the middleware to ensure req.user is available if needed,
    // but we no longer block non-staff users.
    if (req.user) {
        next();
    } else {
        // Fallback if authMiddleware failed to attach user (should not happen if used correctly)
        res.status(401).json({ message: 'Unauthorized: No user found' });
    }
};

module.exports = { authMiddleware, adminGuard };