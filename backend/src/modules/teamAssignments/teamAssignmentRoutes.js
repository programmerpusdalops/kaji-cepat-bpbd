const express = require('express');
const router = express.Router();
const ctrl = require('./teamAssignmentController');
const { createAssignmentValidator } = require('./teamAssignmentValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * Team Assignment Routes
 *
 * GET  /api/v1/team-assignments      - List all team assignments (all authenticated)
 * GET  /api/v1/team-assignments/:id  - Get assignment detail (all authenticated)
 * POST /api/v1/team-assignments      - Create a team assignment (PUSDALOPS, ADMIN)
 */

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// Only PUSDALOPS and ADMIN can create assignments
router.post('/', authorize('PUSDALOPS', 'ADMIN'), createAssignmentValidator, ctrl.create);

module.exports = router;
