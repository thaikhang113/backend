const AuthService = require('../services/authService');

const AuthController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const result = await AuthService.login(username, password);
            // Nếu đăng nhập thành công, trả về token hoặc yêu cầu OTP tùy cấu hình
            // Ở đây giả định trả về user info và trigger OTP nếu cần bảo mật 2 lớp
            // Để đơn giản cho demo: trả về Token luôn
            res.json({ message: 'Đăng nhập thành công', ...result });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    register: async (req, res) => {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json({ message: 'Đăng ký thành công', user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    requestOTP: async (req, res) => {
        try {
            const { username } = req.body;
            await AuthService.requestOTP(username);
            res.json({ message: 'Mã OTP đã được gửi đến email của bạn' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { username, otp } = req.body;
            const result = await AuthService.verifyOTPLogin(username, otp);
            res.json({ message: 'Xác thực OTP thành công', ...result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = AuthController;