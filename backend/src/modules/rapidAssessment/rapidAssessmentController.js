const { validationResult } = require('express-validator');
const service = require('./rapidAssessmentService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * Rapid Assessment Controller — thin route handlers
 */

const getAll = async (req, res, next) => {
    try {
        const { status, disaster_type_id } = req.query;
        const data = await service.getAllAssessments({ status, disaster_type_id });
        return successResponse(res, 'Daftar kaji cepat berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getDropdown = async (req, res, next) => {
    try {
        const data = await service.getDropdownList();
        return successResponse(res, 'Dropdown kaji cepat berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const data = await service.getAssessmentById(parseInt(req.params.id));
        return successResponse(res, 'Detail kaji cepat berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.createAssessment(req.body, req.user.id);
        return successResponse(res, 'Kaji cepat berhasil dibuat.', data, 201);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.updateAssessment(parseInt(req.params.id), req.body);
        return successResponse(res, 'Kaji cepat berhasil diperbarui.', data);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        await service.deleteAssessment(parseInt(req.params.id));
        return successResponse(res, 'Kaji cepat berhasil dihapus.');
    } catch (error) {
        next(error);
    }
};

const generateWA = async (req, res, next) => {
    try {
        const data = await service.generateMessage(parseInt(req.params.id));
        return successResponse(res, 'Pesan WhatsApp berhasil di-generate.', data);
    } catch (error) {
        next(error);
    }
};

const sendWA = async (req, res, next) => {
    try {
        const { phone_numbers } = req.body;
        if (!phone_numbers || !Array.isArray(phone_numbers) || phone_numbers.length === 0) {
            return errorResponse(res, 'Nomor telepon wajib diisi.', 422);
        }

        const data = await service.sendWhatsApp(parseInt(req.params.id), phone_numbers);
        return successResponse(res, 'Pesan WhatsApp berhasil dikirim.', data);
    } catch (error) {
        next(error);
    }
};

const resendWA = async (req, res, next) => {
    try {
        const data = await service.resendWhatsApp(parseInt(req.params.id));
        return successResponse(res, 'Pesan WhatsApp berhasil dikirim ulang.', data);
    } catch (error) {
        next(error);
    }
};

const getWALogs = async (req, res, next) => {
    try {
        const data = await service.getWaSendLogs(parseInt(req.params.id));
        return successResponse(res, 'Log pengiriman WA berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getDropdown,
    getById,
    create,
    update,
    remove,
    generateWA,
    sendWA,
    resendWA,
    getWALogs,
};
