const { body, param } = require('express-validator');

const upsertNeedsValidator = [
    body('assessment_id')
        .notEmpty().withMessage('ID Kaji Cepat (assessment_id) wajib diisi.')
        .isInt().withMessage('ID Kaji Cepat harus berupa angka.'),
    body('needs')
        .isArray({ min: 1 }).withMessage('Needs harus berupa array minimal 1 item.'),
    body('needs.*.item_id')
        .notEmpty().withMessage('ID item wajib diisi .')
        .isInt().withMessage('ID item harus berupa angka.'),
    body('needs.*.quantity')
        .notEmpty().withMessage('Jumlah item wajib diisi.')
        .isInt({ min: 1 }).withMessage('Jumlah item minimal 1.'),
];

const getByAssessmentIdValidator = [
    param('assessment_id').isInt().withMessage('ID Kaji Cepat harus berupa angka.')
];

const getByReportIdValidator = [
    param('report_id').isInt().withMessage('ID Laporan harus berupa angka.')
];

module.exports = {
    upsertNeedsValidator,
    getByAssessmentIdValidator,
    getByReportIdValidator
};
