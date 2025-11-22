const nodemailer = require('nodemailer');
require('dotenv').config();

// --- ĐOẠN CODE KIỂM TRA CẤU HÌNH (DEBUG) ---
console.log("=== KIỂM TRA EMAIL CONFIG ===");
console.log("User:", process.env.EMAIL_USER ? process.env.EMAIL_USER : "CHƯA CẤU HÌNH");
console.log("Pass:", process.env.EMAIL_PASS ? "Đã nhập (Độ dài: " + process.env.EMAIL_PASS.length + ")" : "CHƯA CẤU HÌNH");
console.log("=============================");

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Mã OTP đăng nhập hệ thống Hotel',
        text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn trong 5 phút.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', email);
        return true;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};

const sendInvoiceEmail = async (email, invoiceData) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Hóa đơn thanh toán #${invoiceData.invoice_id}`,
        text: `Cảm ơn quý khách.\nTổng tiền: ${invoiceData.final_amount}\n`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return false;
    }
};

module.exports = {
    sendOTP,
    sendInvoiceEmail
};