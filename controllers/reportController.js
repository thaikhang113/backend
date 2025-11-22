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
            const userId = req.user ? req.user.user_id : 1;
            const report = await ReportService.generateRevenueReport(userId, startDate, endDate, type);
            res.status(201).json(report);
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
    }
};

module.exports = ReportController;