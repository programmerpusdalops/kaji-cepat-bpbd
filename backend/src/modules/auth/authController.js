const { validationResult } = require('express-validator');
const authService = require('./authService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * Auth Controller — thin handlers for auth endpoints
 */

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validasi gagal.', 422, errors.array());
        }

        const { email, password } = req.body;
        const result = await authService.login(email, password);

        return successResponse(res, 'Login berhasil.', result);
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validasi gagal.', 422, errors.array());
        }

        const { name, email, password, role, phone, instansi } = req.body;
        const result = await authService.register({ name, email, password, role, phone, instansi });

        return successResponse(res, 'Registrasi berhasil.', result, 201);
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);
        return successResponse(res, 'Profil user berhasil diambil.', user);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validasi gagal.', 422, errors.array());
        }

        const { name, phone, instansi } = req.body;
        const user = await authService.updateProfile(req.user.id, { name, phone, instansi });
        return successResponse(res, 'Profil berhasil diperbarui.', user);
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validasi gagal.', 422, errors.array());
        }

        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user.id, { currentPassword, newPassword });
        return successResponse(res, 'Password berhasil diubah.');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
};
