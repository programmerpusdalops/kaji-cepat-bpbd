const { body } = require('express-validator');

const disasterTypeValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama jenis bencana wajib diisi.')
        .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter.'),
];

const agencyValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama instansi wajib diisi.')
        .isLength({ max: 150 }).withMessage('Nama maksimal 150 karakter.'),
    body('type')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Tipe maksimal 50 karakter.'),
];

const regionValidator = [
    body('province')
        .trim()
        .notEmpty().withMessage('Provinsi wajib diisi.')
        .isLength({ max: 100 }).withMessage('Provinsi maksimal 100 karakter.'),
    body('regency')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Kabupaten/Kota maksimal 100 karakter.'),
    body('district')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Kecamatan maksimal 100 karakter.'),
    body('village')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Desa/Kelurahan maksimal 100 karakter.'),
];

const needItemValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama item kebutuhan wajib diisi.')
        .isLength({ max: 150 }).withMessage('Nama maksimal 150 karakter.'),
    body('unit')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Satuan maksimal 50 karakter.'),
];

module.exports = {
    disasterTypeValidator,
    agencyValidator,
    regionValidator,
    needItemValidator,
};
