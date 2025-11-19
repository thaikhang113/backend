// Giả lập gửi email (Mocking) vì không dùng thư viện ngoài như nodemailer
// Trong thực tế, bạn sẽ cài nodemailer để gửi thật.

const sendEmail = async (to, subject, content) => {
    console.log("================ EMAIL SYSTEM ================");
    console.log(`Sending to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${content}`);
    console.log("==============================================");
    // Giả lập delay mạng
    return new Promise(resolve => setTimeout(resolve, 500));
};

module.exports = { sendEmail };