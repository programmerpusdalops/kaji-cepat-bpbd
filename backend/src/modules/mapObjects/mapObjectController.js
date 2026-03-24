const { validationResult } = require('express-validator');
const mapObjectService = require('./mapObjectService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * Map Object Controller — thin handlers for collaborative map API
 */

const getByDisaster = async (req, res, next) => {
    try {
        const { disasterId } = req.params;
        const data = await mapObjectService.getByDisasterId(Number(disasterId));
        return successResponse(res, 'Data peta berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getByAssessment = async (req, res, next) => {
    try {
        const { assessmentId } = req.params;
        const data = await mapObjectService.getByAssessmentId(Number(assessmentId));
        return successResponse(res, 'Data peta berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getPublicByAssessment = async (req, res, next) => {
    try {
        const { assessmentId } = req.params;
        const data = await mapObjectService.getByAssessmentId(Number(assessmentId));
        return successResponse(res, 'Data peta berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getPublicByDisaster = async (req, res, next) => {
    try {
        const { disasterId } = req.params;
        const data = await mapObjectService.getByDisasterId(Number(disasterId));
        return successResponse(res, 'Data peta publik berhasil diambil.', data);
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

        const { assessment_id, disaster_id, type, title, description, category, geometry, status } = req.body;
        const result = await mapObjectService.createObject({
            assessment_id,
            disaster_id,
            type,
            title,
            description,
            category,
            geometry,
            status,
            created_by: req.user.id,
        });
        return successResponse(res, 'Object peta berhasil dibuat.', result, 201);
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

        const { id } = req.params;
        const { title, description, category, geometry, status } = req.body;
        const result = await mapObjectService.updateObject(Number(id), {
            title,
            description,
            category,
            geometry,
            status,
        });
        return successResponse(res, 'Object peta berhasil diperbarui.', result);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await mapObjectService.deleteObject(Number(id));
        return successResponse(res, 'Object peta berhasil dihapus.');
    } catch (error) {
        next(error);
    }
};

/**
 * Upload photos for a map object (supports multiple files)
 * Appends new photos to existing ones
 */
const uploadPhotos = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.files || req.files.length === 0) {
            return errorResponse(res, 'File foto tidak ditemukan.', 400);
        }

        // Get existing object to merge photos
        const existing = await mapObjectService.getById(Number(id));
        const existingPhotos = mapObjectService.parsePhotos(existing.photo_path);

        // Add new photos
        const newPhotos = req.files.map(f => `/uploads/map-photos/${f.filename}`);
        const allPhotos = [...existingPhotos, ...newPhotos];

        // Store as JSON array
        const result = await mapObjectService.updateObject(Number(id), {
            photo_path: JSON.stringify(allPhotos),
        });
        return successResponse(res, `${newPhotos.length} foto berhasil diupload.`, result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getByDisaster,
    getByAssessment,
    getPublicByAssessment,
    getPublicByDisaster,
    create,
    update,
    remove,
    uploadPhotos,
};
