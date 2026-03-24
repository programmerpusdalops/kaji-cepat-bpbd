const repo = require('./emergencyNeedsRepository');
const fieldRepo = require('../fieldAssessments/fieldAssessmentRepository');

/**
 * Emergency Needs Service
 */

const { getClient } = require('../../config/database');

const upsertEmergencyNeeds = async (data) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const result = await repo.createOrUpdate(data, client.query.bind(client));
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

const getByAssessmentId = async (assessmentId) => {
    return await repo.findByAssessmentId(assessmentId);
};

const getByReportId = async (reportId) => {
    return await repo.findByReportId(reportId);
};

const getAllNeeds = async () => {
    return await repo.findAll();
};

module.exports = {
    upsertEmergencyNeeds,
    getByAssessmentId,
    getByReportId,
    getAllNeeds
};
