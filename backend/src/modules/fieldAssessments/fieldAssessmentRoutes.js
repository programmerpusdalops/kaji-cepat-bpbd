const express = require('express');
const router = express.Router();
const ctrl = require('./fieldAssessmentController');
const { createAssessmentValidator, getByAssessmentIdValidator } = require('./fieldAssessmentValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * Field Assessment Routes
 *
 * Legacy:
 * GET  /api/v1/field-assessments                    - List all assessments
 * GET  /api/v1/field-assessments/:assessment_id     - List assessments for a kaji cepat
 * POST /api/v1/field-assessments                    - Submit new field assessment (TRC, ADMIN)
 *
 * Juklak:
 * GET  /api/v1/field-assessments/juklak             - List all juklak assessments
 * GET  /api/v1/field-assessments/juklak/:id         - Get juklak detail by ID
 * POST /api/v1/field-assessments/juklak             - Create new juklak assessment
 * PUT  /api/v1/field-assessments/juklak/:id         - Update juklak assessment
 */

router.use(authenticate);

// Juklak routes (must be before :assessment_id to avoid conflict)
router.get('/juklak', ctrl.getAllJuklak);
router.get('/juklak/:id', ctrl.getJuklakById);
router.post('/juklak', authorize('TRC', 'ADMIN', 'PUSDALOPS'), ctrl.createJuklak);
router.put('/juklak/:id', authorize('TRC', 'ADMIN', 'PUSDALOPS'), ctrl.updateJuklak);
router.delete('/juklak/:id', authorize('TRC', 'ADMIN', 'PUSDALOPS'), ctrl.deleteJuklak);

// Legacy routes
router.get('/', ctrl.getAll);
router.get('/:assessment_id', getByAssessmentIdValidator, ctrl.getByAssessmentId);
router.post('/', authorize('TRC', 'ADMIN'), createAssessmentValidator, ctrl.create);

module.exports = router;
