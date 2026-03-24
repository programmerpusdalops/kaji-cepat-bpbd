const { body } = require('express-validator');

/**
 * Auth Validators — input validation rules
 */

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email wajib diisi.')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password wajib diisi.'),
];

const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama wajib diisi.')
        .isLength({ min: 3, max: 100 }).withMessage('Nama harus 3-100 karakter.'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email wajib diisi.')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password wajib diisi.')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
    body('role')
        .optional()
        .isIn(['ADMIN', 'PUSDALOPS', 'TRC', 'PIMPINAN']).withMessage('Role tidak valid.'),
    body('phone')
        .optional()
        .trim()
        .isMobilePhone('id-ID').withMessage('Nomor telepon tidak valid.'),
    body('instansi')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Instansi maksimal 100 karakter.'),
];

const updateProfileValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama wajib diisi.')
        .isLength({ min: 3, max: 100 }).withMessage('Nama harus 3-100 karakter.'),
    body('phone')
        .optional({ nullable: true })
        .trim(),
    body('instansi')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 }).withMessage('Instansi maksimal 100 karakter.'),
];

const changePasswordValidator = [
    body('currentPassword')
        .notEmpty().withMessage('Password lama wajib diisi.'),
    body('newPassword')
        .notEmpty().withMessage('Password baru wajib diisi.')
        .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter.'),
];

module.exports = {
    loginValidator,
    registerValidator,
    updateProfileValidator,
    changePasswordValidator,
};
