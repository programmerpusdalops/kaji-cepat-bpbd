const fieldAssessmentService = require('./fieldAssessmentService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');
const { validationResult } = require('express-validator');

/**
 * Field Assessment Controller
 */

const getAll = async (req, res, next) => {
    try {
        const data = await fieldAssessmentService.getAllAssessments();
        return successResponse(res, 'Data field assessment berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getByAssessmentId = async (req, res, next) => {
    try {
        const { assessment_id } = req.params;
        const data = await fieldAssessmentService.getAssessmentsByAssessmentId(Number(assessment_id));
        return successResponse(res, 'Data field assessment berhasil diambil.', data);
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
        const data = await fieldAssessmentService.createAssessment({
            ...req.body,
            location: req.body.location || {},
        });
        return successResponse(res, 'Field assessment berhasil dibuat.', data, 201);
    } catch (error) {
        next(error);
    }
};

// ──────────────── Juklak endpoints ────────────────

const getAllJuklak = async (req, res, next) => {
    try {
        const data = await fieldAssessmentService.getAllJuklak();
        return successResponse(res, 'Data juklak assessment berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getJuklakById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await fieldAssessmentService.getJuklakById(Number(id));
        return successResponse(res, 'Data juklak assessment berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const createJuklak = async (req, res, next) => {
    try {
        const data = await fieldAssessmentService.createJuklakAssessment({
            ...req.body,
            created_by: req.user?.id || null,
        });
        return successResponse(res, 'Juklak assessment berhasil dibuat.', data, 201);
    } catch (error) {
        next(error);
    }
};

const updateJuklak = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await fieldAssessmentService.updateJuklakAssessment(Number(id), req.body);
        return successResponse(res, 'Juklak assessment berhasil diperbarui.', data);
    } catch (error) {
        next(error);
    }
};

const deleteJuklak = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await fieldAssessmentService.deleteJuklakAssessment(Number(id));
        return successResponse(res, 'Juklak assessment berhasil dihapus.', data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getByAssessmentId,
    create,
    getAllJuklak,
    getJuklakById,
    createJuklak,
    updateJuklak,
    deleteJuklak,
};
