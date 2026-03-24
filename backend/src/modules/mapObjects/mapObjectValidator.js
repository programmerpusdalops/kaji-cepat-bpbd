const { body } = require('express-validator');

/**
 * Map Object Validators — input validation rules
 * Category is now dynamic (no enum restriction)
 */

const createValidator = [
    body('assessment_id')
        .notEmpty().withMessage('Assessment ID wajib diisi.')
        .isInt().withMessage('Assessment ID harus berupa angka.'),
    body('disaster_id')
        .optional()
        .isInt().withMessage('Disaster ID harus berupa angka.'),
    body('type')
        .notEmpty().withMessage('Tipe wajib diisi.')
        .isIn(['marker', 'polygon', 'polyline']).withMessage('Tipe harus marker, polygon, atau polyline.'),
    body('title')
        .trim()
        .notEmpty().withMessage('Judul wajib diisi.')
        .isLength({ max: 200 }).withMessage('Judul maksimal 200 karakter.'),
    body('description')
        .optional()
        .trim(),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Kategori maksimal 100 karakter.'),
    body('geometry')
        .notEmpty().withMessage('Geometry wajib diisi.')
        .isObject().withMessage('Geometry harus berupa object GeoJSON.'),
    body('status')
        .optional()
        .isIn(['aktif', 'ditangani', 'selesai']).withMessage('Status tidak valid.'),
];

const updateValidator = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Judul maksimal 200 karakter.'),
    body('description')
        .optional()
        .trim(),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Kategori maksimal 100 karakter.'),
    body('geometry')
        .optional()
        .isObject().withMessage('Geometry harus berupa object GeoJSON.'),
    body('status')
        .optional()
        .isIn(['aktif', 'ditangani', 'selesai']).withMessage('Status tidak valid.'),
];

module.exports = {
    createValidator,
    updateValidator,
};
