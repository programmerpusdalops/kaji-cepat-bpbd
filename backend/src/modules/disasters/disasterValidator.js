const { body } = require('express-validator');

const createReportValidator = [
    body('disaster_type_id')
        .notEmpty().withMessage('Jenis bencana wajib diisi.')
        .isInt().withMessage('Jenis bencana harus berupa ID.'),
    body('reporter_name')
        .trim()
        .notEmpty().withMessage('Nama pelapor wajib diisi.')
        .isLength({ max: 100 }).withMessage('Nama pelapor maks 100 karakter.'),
    body('report_source')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Sumber laporan maks 50 karakter.'),
    body('description')
        .optional()
        .trim(),
    body('latitude')
        .notEmpty().withMessage('Latitude wajib diisi.')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitude tidak valid.'),
    body('longitude')
        .notEmpty().withMessage('Longitude wajib diisi.')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitude tidak valid.'),
    body('report_time')
        .optional()
        .isISO8601().withMessage('Format waktu laporan tidak valid.'),
];

const verifyReportValidator = [
    body('status')
        .notEmpty().withMessage('Status verifikasi wajib diisi.')
        .isIn(['VERIFIED', 'REJECTED', 'MONITORING']).withMessage('Status harus VERIFIED, REJECTED, atau MONITORING.'),
    body('verification_note')
        .optional()
        .trim(),
];

module.exports = {
    createReportValidator,
    verifyReportValidator,
};
