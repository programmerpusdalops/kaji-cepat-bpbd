const { validationResult } = require('express-validator');
const service = require('./emergencyNeedsService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * Emergency Needs Controller
 */

const upsert = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        // Will throw if assessment_id FK is violated
        const needs = await service.upsertEmergencyNeeds(req.body);
        return successResponse(res, 'Kebutuhan mendesak berhasil disimpan.', needs, 201);
    } catch (error) {
        if (error.code === '23503') { // Postgres FK violation
            return errorResponse(res, 'Data kaji cepat (assessment_id) tidak ditemukan.', 404);
        }
        next(error);
    }
};

const getByAssessmentId = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const needs = await service.getByAssessmentId(parseInt(req.params.assessment_id));
        if (!needs) {
            return successResponse(res, 'Belum ada data kebutuhan mendesak untuk assessment ini.', null);
        }
        return successResponse(res, 'Kebutuhan mendesak berhasil diambil.', needs);
    } catch (error) {
        next(error);
    }
};

const getByReportId = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const needs = await service.getByReportId(parseInt(req.params.report_id));
        return successResponse(res, 'Kebutuhan mendesak berhasil diambil berdasarkan laporan.', needs);
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const needs = await service.getAllNeeds();
        return successResponse(res, 'Daftar semua kebutuhan mendesak berhasil diambil.', needs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    upsert,
    getByAssessmentId,
    getByReportId,
    getAll
};
