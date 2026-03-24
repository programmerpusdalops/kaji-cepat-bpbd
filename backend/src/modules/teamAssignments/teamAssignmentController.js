const { validationResult } = require('express-validator');
const service = require('./teamAssignmentService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * Team Assignment Controller
 */

const getAll = async (req, res, next) => {
    try {
        const { report_id, status } = req.query;
        const assignments = await service.getAllAssignments({ report_id, status });
        return successResponse(res, 'Daftar penugasan tim berhasil diambil.', assignments);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const assignment = await service.getAssignmentById(parseInt(req.params.id));
        return successResponse(res, 'Detail penugasan tim berhasil diambil.', assignment);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        // req.user is set by authentication middleware
        const assignment = await service.createAssignment(req.body, req.user.id);
        return successResponse(res, 'Penugasan tim berhasil dibuat.', assignment, 201);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create,
};
