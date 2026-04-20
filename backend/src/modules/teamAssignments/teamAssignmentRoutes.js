const express = require('express');
const router = express.Router();
const ctrl = require('./teamAssignmentController');
const { createAssignmentValidator, updateAssignmentValidator } = require('./teamAssignmentValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * Team Assignment Routes — Full CRUD
 *
 * GET    /api/v1/team-assignments      - List all
 * GET    /api/v1/team-assignments/:id  - Get detail
 * POST   /api/v1/team-assignments      - Create
 * PUT    /api/v1/team-assignments/:id  - Update
 * DELETE /api/v1/team-assignments/:id  - Delete
 */

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authorize('PUSDALOPS', 'ADMIN'), createAssignmentValidator, ctrl.create);
router.put('/:id', authorize('PUSDALOPS', 'ADMIN'), updateAssignmentValidator, ctrl.update);
router.delete('/:id', authorize('PUSDALOPS', 'ADMIN'), ctrl.remove);

module.exports = router;
