const ReportService = require('../services/reportService');
const Report = require('../models/report');

const ReportController = {
    getDashboard: async (req, res) => {
        try {
            const stats = await ReportService.getDashboardData();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    generateRevenueReport: async (req, res) => {
        try {
            const { startDate, endDate, type } = req.body;
            // Mặc định admin (ID 1) nếu không có user đăng nhập
            const userId = req.user ? req.user.user_id : 1; 
            
            const report = await ReportService.generateRevenueReport(userId, startDate, endDate, type);
            res.status(201).json({
                message: "Báo cáo doanh thu đã được tạo thành công",
                data: report
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllReports: async (req, res) => {
        try {
            const reports = await Report.getAll();
            res.json(reports);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // CẬP NHẬT: Xóa báo cáo
    deleteReport: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await Report.delete(id);
            
            if (!result) {
                return res.status(404).json({ message: 'Report not found' });
            }
            
            res.json({ message: 'Báo cáo đã được xóa thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = ReportController;