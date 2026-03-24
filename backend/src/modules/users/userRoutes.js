const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { createUserValidator, updateUserValidator } = require('./userValidator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * User Routes — ADMIN only
 * GET    /api/v1/users        — List all users
 * POST   /api/v1/users        — Create user
 * GET    /api/v1/users/:id    — Get user by ID
 * PUT    /api/v1/users/:id    — Update user
 * DELETE /api/v1/users/:id    — Soft delete user
 */

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', userController.getAll);
router.post('/', createUserValidator, userController.create);
router.get('/:id', userController.getById);
router.put('/:id', updateUserValidator, userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
