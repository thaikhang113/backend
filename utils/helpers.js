const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
};

module.exports = {
    generateOTP,
    formatDate
};