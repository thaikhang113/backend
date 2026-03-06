const jwt = require('jsonwebtoken');

// Xác thực user từ JWT hoặc bỏ qua auth trong môi trường dev (SKIP_AUTH=true)
const authMiddleware = (req, res, next) => {
    // Cho phép bypass auth khi đang dev / test
    if (process.env.SKIP_AUTH === 'true') {
        req.user = {
            user_id: 1,
            is_staff: true,
            username: 'dev-admin'
        };
        return next();
    }

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_change_me');
        // decoded nên chứa tối thiểu: user_id, is_staff
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT verify error:', err.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

// Chỉ cho admin (is_staff = true)
const adminGuard = (req, res, next) => {
    if (!req.user || !req.user.is_staff) {
        return res.status(403).json({ message: 'Forbidden: Admin only' });
    }
    next();
};

module.exports = { authMiddleware, adminGuard };

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