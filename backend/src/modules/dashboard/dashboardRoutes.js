const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const dashboardController = require('./dashboardController');

/**
 * Dashboard Routes
 *
 * GET /api/v1/dashboard — Get aggregated dashboard analytics data
 */

router.use(authenticate);

router.get('/', dashboardController.getDashboard);

module.exports = router;
