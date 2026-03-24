const express = require('express');
const router = express.Router();
const ctrl = require('./disasterController');
const { createReportValidator, verifyReportValidator } = require('./disasterValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * Disaster Reports Routes
 *
 * GET    /api/v1/disaster-reports          — List reports (all authenticated)
 * POST   /api/v1/disaster-reports          — Create report (PUSDALOPS, ADMIN)
 * GET    /api/v1/disaster-reports/:id      — Get report detail (all authenticated)
 * POST   /api/v1/disaster-reports/:id/verify — Verify report (PUSDALOPS, ADMIN)
 */

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', authorize('PUSDALOPS', 'ADMIN'), createReportValidator, ctrl.create);
router.get('/:id', ctrl.getById);
router.post('/:id/verify', authorize('PUSDALOPS', 'ADMIN'), verifyReportValidator, ctrl.verify);

module.exports = router;
