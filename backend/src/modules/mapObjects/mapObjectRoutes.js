const express = require('express');
const router = express.Router();
const ctrl = require('./mapObjectController');
const { createValidator, updateValidator } = require('./mapObjectValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const { uploadMapPhoto } = require('../../middlewares/uploadMiddleware');

/**
 * Map Object Routes
 *
 * PUBLIC (no auth):
 * GET  /api/v1/map-objects/public/:disasterId — Get GeoJSON for public map
 *
 * PROTECTED:
 * GET    /api/v1/map-objects/:disasterId       — Get all objects for a disaster
 * POST   /api/v1/map-objects                   — Create map object
 * PUT    /api/v1/map-objects/:id               — Update map object
 * DELETE /api/v1/map-objects/:id               — Delete map object
 * POST   /api/v1/map-objects/:id/photos        — Upload photos for map object (max 5)
 */

// ── Public endpoint (no auth) ──
router.get('/public/assessment/:assessmentId', ctrl.getPublicByAssessment);
router.get('/public/:disasterId', ctrl.getPublicByDisaster);

// ── Protected endpoints ──
router.use(authenticate);

router.get('/assessment/:assessmentId', ctrl.getByAssessment);
router.get('/:disasterId', ctrl.getByDisaster);
router.post('/', authorize('ADMIN', 'PUSDALOPS', 'TRC'), createValidator, ctrl.create);
router.put('/:id', authorize('ADMIN', 'PUSDALOPS', 'TRC'), updateValidator, ctrl.update);
router.delete('/:id', authorize('ADMIN', 'PUSDALOPS', 'TRC'), ctrl.remove);
router.post('/:id/photos', authorize('ADMIN', 'PUSDALOPS', 'TRC'), uploadMapPhoto.array('photos', 5), ctrl.uploadPhotos);

module.exports = router;
