const sendEmail = (to, subject, text) => {
    // Mô phỏng gửi email
    console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject} | Content: ${text}`);
};

module.exports = { sendEmail };