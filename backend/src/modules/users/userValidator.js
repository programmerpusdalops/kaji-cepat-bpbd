const { body } = require('express-validator');

/**
 * User Validators — input validation rules
 */

const createUserValidator = [
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
        .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.'),
    body('role')
        .notEmpty().withMessage('Role wajib diisi.')
        .isIn(['ADMIN', 'PUSDALOPS', 'TRC', 'PIMPINAN']).withMessage('Role tidak valid.'),
    body('phone')
        .optional()
        .trim(),
    body('instansi')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Instansi maksimal 100 karakter.'),
];

const updateUserValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Nama harus 3-100 karakter.'),
    body('role')
        .optional()
        .isIn(['ADMIN', 'PUSDALOPS', 'TRC', 'PIMPINAN']).withMessage('Role tidak valid.'),
    body('phone')
        .optional()
        .trim(),
    body('instansi')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Instansi maksimal 100 karakter.'),
];

module.exports = {
    createUserValidator,
    updateUserValidator,
};
