const { body } = require('express-validator');

const createAssignmentValidator = [
    body('assessment_id')
        .notEmpty().withMessage('ID Kaji Cepat wajib diisi.')
        .isInt().withMessage('ID Kaji Cepat harus berupa angka.'),
    body('team_name')
        .trim()
        .notEmpty().withMessage('Nama tim wajib diisi.')
        .isLength({ max: 100 }).withMessage('Nama tim maksimal 100 karakter.'),
    body('leader')
        .trim()
        .notEmpty().withMessage('Nama ketua tim wajib diisi.')
        .isLength({ max: 100 }).withMessage('Nama ketua tim maksimal 100 karakter.'),
    body('total_members')
        .notEmpty().withMessage('Jumlah anggota wajib diisi.')
        .isInt({ min: 1 }).withMessage('Jumlah anggota minimal 1 orang.'),
    body('vehicle')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Kendaraan maksimal 100 karakter.'),
    body('departure_time')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Format waktu keberangkatan tidak valid.'),
    body('arrival_estimate')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Format estimasi kedatangan tidak valid.'),
    body('members')
        .optional()
        .isArray().withMessage('Members harus berupa array.'),
    body('members.*.name')
        .optional()
        .trim()
        .notEmpty().withMessage('Nama anggota wajib diisi.')
        .isLength({ max: 100 }).withMessage('Nama anggota maksimal 100 karakter.'),
    body('members.*.division')
        .optional()
        .trim()
        .notEmpty().withMessage('Bagian anggota wajib diisi.')
        .isIn(['PUSDALOPS', 'TRC', 'LOGISTIK']).withMessage('Bagian harus PUSDALOPS, TRC, atau LOGISTIK.'),
];

module.exports = {
    createAssignmentValidator,
};
