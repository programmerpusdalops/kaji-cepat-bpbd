const express = require('express');
const router = express.Router();
const ctrl = require('./wilayahController');
const { authenticate } = require('../../middlewares/authMiddleware');

/**
 * Wilayah (EMSIFA Hybrid) Routes
 * 
 * GET /api/v1/wilayah/provinces
 * GET /api/v1/wilayah/regencies?province_id=
 * GET /api/v1/wilayah/districts?regency_id=
 * GET /api/v1/wilayah/villages?district_id=
 * POST /api/v1/wilayah/sync-all
 */

router.use(authenticate);

router.get('/provinces', ctrl.getProvinces);
router.get('/regencies', ctrl.getRegencies);
router.get('/districts', ctrl.getDistricts);
router.get('/villages', ctrl.getVillages);
router.post('/sync-all', ctrl.syncAll);

module.exports = router;
