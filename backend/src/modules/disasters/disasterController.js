const { validationResult } = require('express-validator');
const service = require('./disasterService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * Disaster Reports Controller
 */

const getAll = async (req, res, next) => {
    try {
        const { status, disaster_type_id } = req.query;
        const reports = await service.getAllReports({ status, disaster_type_id });
        return successResponse(res, 'Daftar laporan bencana berhasil diambil.', reports);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const report = await service.getReportById(parseInt(req.params.id));
        return successResponse(res, 'Detail laporan bencana berhasil diambil.', report);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const report = await service.createReport(req.body);
        return successResponse(res, 'Laporan bencana berhasil dibuat.', report, 201);
    } catch (error) {
        next(error);
    }
};

const verify = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const { status, verification_note } = req.body;
        const log = await service.verifyReport(
            parseInt(req.params.id),
            req.user.id,
            { status, verification_note }
        );
        return successResponse(res, 'Laporan berhasil diverifikasi.', log);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    verify,
};
