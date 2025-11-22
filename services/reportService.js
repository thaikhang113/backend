const Report = require('../models/report');
const StatsRepository = require('../repositories/statsRepository');

const ReportService = {
    generateRevenueReport: async (userId, startDate, endDate, type = 'daily') => {
        const stats = await StatsRepository.getRevenueStats(startDate, endDate, type);
        const summary = await Report.getRevenueByRange(startDate, endDate);

        const reportContent = {
            summary: summary,
            details: stats
        };

        const reportData = {
            title: `Revenue Report (${type}) from ${startDate} to ${endDate}`,
            type: 'revenue',
            start_date: startDate,
            end_date: endDate,
            revenue: summary.total_revenue || 0,
            content: JSON.stringify(reportContent),
            created_by: userId
        };

        return await Report.create(reportData);
    },

    getDashboardData: async () => {
        return await StatsRepository.getDashboardSummary();
    }
};

module.exports = ReportService;