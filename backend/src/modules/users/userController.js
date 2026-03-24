const { validationResult } = require('express-validator');
const userService = require('./userService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * User Controller — thin handlers for user CRUD
 */

const getAll = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        return successResponse(res, 'Daftar user berhasil diambil.', users);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(parseInt(req.params.id));
        return successResponse(res, 'Detail user berhasil diambil.', user);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validasi gagal.', 422, errors.array());
        }

        const { name, email, password, role, phone, instansi } = req.body;
        const user = await userService.createUser({ name, email, password, role, phone, instansi });
        return successResponse(res, 'User berhasil dibuat.', user, 201);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'Validasi gagal.', 422, errors.array());
        }

        const { name, role, phone, instansi } = req.body;
        const user = await userService.updateUser(parseInt(req.params.id), { name, role, phone, instansi });
        return successResponse(res, 'User berhasil diperbarui.', user);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        await userService.deleteUser(parseInt(req.params.id));
        return successResponse(res, 'User berhasil dinonaktifkan.');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
