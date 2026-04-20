const { body } = require('express-validator');

/**
 * Shared ST (Surat Tugas) field validators
 */
const stFieldValidators = [
    body('nomor_surat')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Nomor surat maksimal 100 karakter.'),
    body('tanggal_surat')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Tanggal surat maksimal 20 karakter.'),
    body('bulan_surat')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Bulan surat maksimal 20 karakter.'),
    body('tahun_surat')
        .optional()
        .trim()
        .isLength({ max: 10 }).withMessage('Tahun surat maksimal 10 karakter.'),
    body('desa')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Desa maksimal 100 karakter.'),
    body('nama_aparat_desa')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Nama aparat desa maksimal 100 karakter.'),
];

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
    ...stFieldValidators,
];

const updateAssignmentValidator = [
    body('assessment_id')
        .optional()
        .isInt().withMessage('ID Kaji Cepat harus berupa angka.'),
    body('team_name')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Nama tim maksimal 100 karakter.'),
    body('leader')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Nama ketua tim maksimal 100 karakter.'),
    body('total_members')
        .optional()
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
        .isIn(['PUSDALOPS', 'TRC', 'LOGISTIK']).withMessage('Bagian harus PUSDALOPS, TRC, atau LOGISTIK.'),
    ...stFieldValidators,
];

module.exports = {
    createAssignmentValidator,
    updateAssignmentValidator,
};
