const express = require('express');
const router = express.Router();
const ctrl = require('./emergencyNeedsController');
const { upsertNeedsValidator, getByAssessmentIdValidator, getByReportIdValidator } = require('./emergencyNeedsValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * Emergency Needs Routes
 *
 * GET  /api/v1/emergency-needs                   - Get all emergency needs
 * GET  /api/v1/emergency-needs/assessment/:id    - Get needs for a specific assessment
 * GET  /api/v1/emergency-needs/report/:id        - Get needs for a specific report
 * POST /api/v1/emergency-needs                   - Upsert emergency needs (TRC, PUSDALOPS, ADMIN)
 */

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/assessment/:assessment_id', getByAssessmentIdValidator, ctrl.getByAssessmentId);
router.get('/report/:report_id', getByReportIdValidator, ctrl.getByReportId);

router.post('/', authorize('TRC', 'PUSDALOPS', 'ADMIN'), upsertNeedsValidator, ctrl.upsert);

module.exports = router;
