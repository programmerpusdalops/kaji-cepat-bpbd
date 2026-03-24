const { body } = require('express-validator');

/**
 * Rapid Assessment Validators
 */

const createValidator = [
    body('disaster_type_id')
        .notEmpty().withMessage('Jenis bencana wajib diisi.')
        .isInt({ min: 1 }).withMessage('Jenis bencana harus berupa ID valid.'),
    body('regency')
        .notEmpty().withMessage('Kabupaten wajib diisi.')
        .trim(),
    body('district')
        .notEmpty().withMessage('Kecamatan wajib diisi.')
        .trim(),
    body('waktu_kejadian')
        .notEmpty().withMessage('Waktu kejadian wajib diisi.')
        .isISO8601().withMessage('Format waktu kejadian tidak valid.'),
    body('waktu_laporan')
        .notEmpty().withMessage('Waktu laporan wajib diisi.')
        .isISO8601().withMessage('Format waktu laporan tidak valid.'),
    body('villages')
        .isArray({ min: 1 }).withMessage('Minimal 1 desa harus dipilih.'),
    body('villages.*')
        .notEmpty().withMessage('Nama desa tidak boleh kosong.')
        .trim(),
];

const updateValidator = [
    body('disaster_type_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Jenis bencana harus berupa ID valid.'),
    body('regency')
        .optional()
        .trim(),
    body('district')
        .optional()
        .trim(),
    body('waktu_kejadian')
        .optional()
        .isISO8601().withMessage('Format waktu kejadian tidak valid.'),
    body('waktu_laporan')
        .optional()
        .isISO8601().withMessage('Format waktu laporan tidak valid.'),
];

module.exports = {
    createValidator,
    updateValidator,
};
