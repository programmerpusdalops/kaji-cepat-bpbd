const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { loginValidator, registerValidator, updateProfileValidator, changePasswordValidator } = require('./authValidator');
const { authenticate } = require('../../middlewares/authMiddleware');

/**
 * Auth Routes
 * POST /api/v1/auth/login            — Login
 * POST /api/v1/auth/register         — Register
 * GET  /api/v1/auth/me               — Get current user profile (protected)
 * PUT  /api/v1/auth/profile          — Update own profile (protected)
 * PUT  /api/v1/auth/change-password   — Change own password (protected)
 */

router.post('/login', loginValidator, authController.login);
router.post('/register', registerValidator, authController.register);
router.get('/me', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidator, authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidator, authController.changePassword);

module.exports = router;
