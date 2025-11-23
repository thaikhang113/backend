const nodemailer = require('nodemailer');
require('dotenv').config();

// --- ĐOẠN CODE KIỂM TRA CẤU HÌNH (DEBUG) ---
console.log("=== KIỂM TRA EMAIL CONFIG ===");
console.log("User:", process.env.EMAIL_USER ? process.env.EMAIL_USER : "CHƯA CẤU HÌNH");
console.log("Pass:", process.env.EMAIL_PASS ? "Đã nhập" : "CHƯA CẤU HÌNH");
console.log("=============================");

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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
    sendInvoiceEmail
};