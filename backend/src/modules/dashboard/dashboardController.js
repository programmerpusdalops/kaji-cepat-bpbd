const dashboardService = require('./dashboardService');
const { successResponse } = require('../../utils/responseFormatter');

/**
 * Dashboard Controller — thin layer
 */

const getDashboard = async (req, res, next) => {
    try {
        const data = await dashboardService.getDashboardData();
        return successResponse(res, 'Dashboard data berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
};
