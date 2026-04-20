const express = require('express');
const router = express.Router();
const ctrl = require('./rapidAssessmentController');
const { createValidator, updateValidator } = require('./rapidAssessmentValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const { uploadAssessmentPhoto } = require('../../middlewares/uploadMiddleware');

/**
 * Rapid Assessment Routes
 *
 * GET    /api/v1/rapid-assessments              — List all assessments
 * GET    /api/v1/rapid-assessments/:id          — Get assessment detail
 * POST   /api/v1/rapid-assessments              — Create new assessment
 * PUT    /api/v1/rapid-assessments/:id          — Update assessment
 * DELETE /api/v1/rapid-assessments/:id          — Delete assessment
 * POST   /api/v1/rapid-assessments/upload-photos — Upload photos
 * POST   /api/v1/rapid-assessments/:id/generate-wa  — Generate WA message preview
 * POST   /api/v1/rapid-assessments/:id/send-wa      — Send WA via Fonnte
 * POST   /api/v1/rapid-assessments/:id/resend-wa    — Resend failed WA
 * GET    /api/v1/rapid-assessments/:id/wa-logs      — Get WA send logs
 */

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/dropdown', ctrl.getDropdown);
router.get('/:id', ctrl.getById);
router.post('/upload-photos', authorize('PUSDALOPS', 'ADMIN'), uploadAssessmentPhoto.array('photos', 5), ctrl.uploadPhotos);
router.post('/', authorize('PUSDALOPS', 'ADMIN'), createValidator, ctrl.create);
router.put('/:id', authorize('PUSDALOPS', 'ADMIN'), updateValidator, ctrl.update);
router.patch('/:id/status', authorize('PUSDALOPS', 'ADMIN'), ctrl.updateStatus);
router.delete('/:id', authorize('PUSDALOPS', 'ADMIN'), ctrl.remove);
router.post('/:id/generate-wa', authorize('PUSDALOPS', 'ADMIN'), ctrl.generateWA);
router.post('/:id/send-wa', authorize('PUSDALOPS', 'ADMIN'), ctrl.sendWA);
router.post('/:id/resend-wa', authorize('PUSDALOPS', 'ADMIN'), ctrl.resendWA);
router.get('/:id/wa-logs', ctrl.getWALogs);

module.exports = router;
