const fieldAssessmentRepo = require('./fieldAssessmentRepository');
const rapidRepo = require('../rapidAssessment/rapidAssessmentRepository');
const { getClient } = require('../../config/database');

/**
 * Field Assessment Service — business logic
 */

// ──────────────── Legacy: create with sub-tables ────────────────

const createAssessment = async (data) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Verify the rapid assessment exists
        const rapid = await rapidRepo.findById(data.assessment_id);
        if (!rapid) {
            const error = new Error('Data kaji cepat tidak ditemukan.');
            error.statusCode = 404;
            throw error;
        }

        const assessment = await fieldAssessmentRepo.createAssessment(data, client);
        const fId = assessment.id;

        if (data.victims) {
            await fieldAssessmentRepo.createVictims(fId, data.victims, client);
        }
        if (data.house_damage) {
            await fieldAssessmentRepo.createHouseDamage(fId, data.house_damage, client);
        }
        if (data.facility_damage) {
            await fieldAssessmentRepo.createFacilityDamage(fId, data.facility_damage, client);
        }
        if (data.infrastructure_damage) {
            await fieldAssessmentRepo.createInfrastructureDamage(fId, data.infrastructure_damage, client);
        }

        await client.query('COMMIT');
        return assessment;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getAssessmentsByAssessmentId = async (assessmentId) => {
    return fieldAssessmentRepo.findByAssessmentId(assessmentId);
};

const getAllAssessments = async () => {
    return fieldAssessmentRepo.findAll();
};

// ──────────────── Juklak: full JSONB detail ────────────────

/**
 * Create a Juklak field assessment with auto-fill from rapid_assessment
 */
const createJuklakAssessment = async (data) => {
    // Verify rapid assessment exists
    const rapid = await rapidRepo.findById(data.assessment_id);
    if (!rapid) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    // Auto-fill from rapid assessment if not manually overridden
    const detail = data.detail || {};
    if (!detail.pendahuluan) {
        detail.pendahuluan = {};
    }
    if (!detail.pendahuluan.jenis_kejadian) {
        detail.pendahuluan.jenis_kejadian = rapid.disaster_type_name || '';
    }
    if (!detail.pendahuluan.lokasi) {
        const parts = [rapid.district, rapid.regency, rapid.province].filter(Boolean);
        detail.pendahuluan.lokasi = parts.join(', ');
    }
    if (!detail.pendahuluan.waktu_kejadian) {
        detail.pendahuluan.waktu_kejadian = rapid.waktu_kejadian;
    }
    if (!detail.pendahuluan.kronologis) {
        detail.pendahuluan.kronologis = rapid.kronologis || '';
    }

    // Auto-fill informasi_lain.sumber from kaji cepat sources
    if (!detail.informasi_lain) {
        detail.informasi_lain = {};
    }
    if (rapid.sources && rapid.sources.length > 0) {
        detail.informasi_lain.sumber_informasi = rapid.sources.map(s => s.sumber).join(', ');
    }

    return fieldAssessmentRepo.createJuklak({
        ...data,
        detail,
        province: data.province || rapid.province || 'Sulawesi Tengah',
        regency: data.regency || rapid.regency || '',
        district: data.district || rapid.district || '',
    });
};

/**
 * Update a Juklak field assessment
 */
const updateJuklakAssessment = async (id, data) => {
    const existing = await fieldAssessmentRepo.findByIdFull(id);
    if (!existing) {
        const error = new Error('Data field assessment tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return fieldAssessmentRepo.updateJuklak(id, data);
};

/**
 * Get Juklak assessment by ID (full detail)
 */
const getJuklakById = async (id) => {
    const result = await fieldAssessmentRepo.findByIdFull(id);
    if (!result) {
        const error = new Error('Data field assessment tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

/**
 * List all Juklak assessments
 */
const getAllJuklak = async () => {
    return fieldAssessmentRepo.findAllJuklak();
};

/**
 * Delete Juklak assessment
 */
const deleteJuklakAssessment = async (id) => {
    const existing = await fieldAssessmentRepo.findByIdFull(id);
    if (!existing) {
        const error = new Error('Data field assessment tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return fieldAssessmentRepo.deleteJuklak(id);
};

module.exports = {
    createAssessment,
    getAssessmentsByAssessmentId,
    getAllAssessments,
    // Juklak
    createJuklakAssessment,
    updateJuklakAssessment,
    getJuklakById,
    getAllJuklak,
    deleteJuklakAssessment,
};
