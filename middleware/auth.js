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
        // decoded nên chứa tối thiểu: user_id
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT verify error:', err.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = { authMiddleware };