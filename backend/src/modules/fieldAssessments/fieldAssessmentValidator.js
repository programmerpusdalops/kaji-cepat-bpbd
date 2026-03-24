const { body, param } = require('express-validator');

const createAssessmentValidator = [
    body('assessment_id')
        .notEmpty().withMessage('ID Kaji Cepat wajib diisi.')
        .isInt().withMessage('ID Kaji Cepat harus berupa angka.'),

    // Location
    body('location.province').optional().trim(),
    body('location.regency').optional().trim(),
    body('location.district').optional().trim(),
    body('location.village').optional().trim(),
    body('location.latitude').notEmpty().withMessage('Latitude wajib diisi.').isFloat({ min: -90, max: 90 }).withMessage('Latitude tidak valid.'),
    body('location.longitude').notEmpty().withMessage('Longitude wajib diisi.').isFloat({ min: -180, max: 180 }).withMessage('Longitude tidak valid.'),

    // Victims
    body('victims.dead').optional().isInt({ min: 0 }),
    body('victims.missing').optional().isInt({ min: 0 }),
    body('victims.severe_injured').optional().isInt({ min: 0 }),
    body('victims.minor_injured').optional().isInt({ min: 0 }),
    body('victims.evacuated').optional().isInt({ min: 0 }),

    // House Damage
    body('house_damage.heavy').optional().isInt({ min: 0 }),
    body('house_damage.moderate').optional().isInt({ min: 0 }),
    body('house_damage.light').optional().isInt({ min: 0 }),

    // Facility Damage
    body('facility_damage.school').optional().isInt({ min: 0 }),
    body('facility_damage.hospital').optional().isInt({ min: 0 }),
    body('facility_damage.worship_place').optional().isInt({ min: 0 }),
    body('facility_damage.government_building').optional().isInt({ min: 0 }),

    // Infrastructure Damage
    body('infrastructure_damage.road').optional().isInt({ min: 0 }),
    body('infrastructure_damage.bridge').optional().isInt({ min: 0 }),
    body('infrastructure_damage.electricity').optional().isInt({ min: 0 }),
    body('infrastructure_damage.water').optional().isInt({ min: 0 }),
    body('infrastructure_damage.telecommunication').optional().isInt({ min: 0 }),
];

const getByAssessmentIdValidator = [
    param('assessment_id').isInt().withMessage('ID Kaji Cepat harus berupa angka.')
];

module.exports = {
    createAssessmentValidator,
    getByAssessmentIdValidator,
};
