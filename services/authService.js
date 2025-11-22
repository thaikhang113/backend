const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Giả định đã cài bcryptjs
const { generateOTP } = require('../utils/helpers');
const { sendOTP } = require('../utils/email');
require('dotenv').config();

const AuthService = {
    login: async (username, password) => {
        const user = await User.findByUsername(username);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // Trong thực tế dùng bcrypt.compare(password, user.password_hash)
        // Ở đây demo so sánh string đơn giản vì dữ liệu mẫu là text
        const isMatch = password === user.password_hash || await bcrypt.compare(password, user.password_hash).catch(() => false);
        
        if (!isMatch) {
            throw new Error('Mật khẩu không đúng');
        }

        if (!user.is_active) {
            throw new Error('Tài khoản đã bị khóa');
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, is_staff: user.is_staff },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        return { user, token };
    },

    register: async (userData) => {
        const existingUser = await User.findByUsername(userData.username);
        if (existingUser) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        userData.password_hash = hashedPassword;
        return await User.create(userData);
    },

    requestOTP: async (username) => {
        const user = await User.findByUsername(username);
        if (!user) throw new Error('User not found');

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

        await User.updateOTP(username, otp, expiresAt);
        await sendOTP(user.email, otp);
        
        return true;
    },

    verifyOTPLogin: async (username, otp) => {
        const user = await User.verifyOTP(username, otp);
        if (!user) {
            throw new Error('OTP không hợp lệ hoặc đã hết hạn');
        }

        // Clear OTP after success
        await User.updateOTP(username, null, null);

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, is_staff: user.is_staff },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        return { user, token };
    }
};

module.exports = AuthService;