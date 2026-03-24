const express = require('express');
const router = express.Router();
const ctrl = require('./masterDataController');
const { disasterTypeValidator, agencyValidator, regionValidator, needItemValidator } = require('./masterDataValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * Master Data Routes
 *
 * Public (authenticated):
 *   GET  /api/v1/master-data            — All master data combined
 *   GET  /api/v1/master-data/disaster-types  — List disaster types
 *   GET  /api/v1/master-data/agencies   — List agencies
 *   GET  /api/v1/master-data/regions    — List regions (filterable)
 *   GET  /api/v1/master-data/need-items — List need items
 *
 * ADMIN only:
 *   POST/PUT/DELETE on disaster-types, agencies, regions, and need-items
 */

router.use(authenticate);

// Read — all authenticated users
router.get('/', ctrl.getAll);
router.get('/disaster-types', ctrl.getDisasterTypes);
router.get('/agencies', ctrl.getAgencies);
router.get('/regions', ctrl.getRegions);
router.get('/need-items', ctrl.getNeedItems);

// Write — ADMIN only
router.post('/disaster-types', authorize('ADMIN'), disasterTypeValidator, ctrl.createDisasterType);
router.put('/disaster-types/:id', authorize('ADMIN'), disasterTypeValidator, ctrl.updateDisasterType);
router.delete('/disaster-types/:id', authorize('ADMIN'), ctrl.deleteDisasterType);

router.post('/agencies', authorize('ADMIN'), agencyValidator, ctrl.createAgency);
router.put('/agencies/:id', authorize('ADMIN'), agencyValidator, ctrl.updateAgency);
router.delete('/agencies/:id', authorize('ADMIN'), ctrl.deleteAgency);

router.post('/regions', authorize('ADMIN'), regionValidator, ctrl.createRegion);
router.put('/regions/:id', authorize('ADMIN'), regionValidator, ctrl.updateRegion);
router.delete('/regions/:id', authorize('ADMIN'), ctrl.deleteRegion);

router.post('/need-items', authorize('ADMIN'), needItemValidator, ctrl.createNeedItem);
router.put('/need-items/:id', authorize('ADMIN'), needItemValidator, ctrl.updateNeedItem);
router.delete('/need-items/:id', authorize('ADMIN'), ctrl.deleteNeedItem);

module.exports = router;
