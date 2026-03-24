const repo = require('./teamAssignmentRepository');
const rapidRepo = require('../rapidAssessment/rapidAssessmentRepository');
const { getClient } = require('../../config/database');

/**
 * Team Assignment Service
 * Updated: Uses rapid_assessments instead of disaster_reports
 */

const getAllAssignments = async (filters) => {
    const assignments = await repo.findAll(filters);
    // Attach members to each assignment
    for (const a of assignments) {
        a.members = await repo.findMembersByAssignmentId(a.id);
    }
    return assignments;
};

const getAssignmentById = async (id) => {
    const assignment = await repo.findById(id);
    if (!assignment) {
        const error = new Error('Penugasan tim tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    assignment.members = await repo.findMembersByAssignmentId(id);
    return assignment;
};

const createAssignment = async (data, userId) => {
    // Check if assessment exists
    const assessment = await rapidRepo.findById(data.assessment_id);
    if (!assessment) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        // 1. Create team assignment
        const assignment = await repo.create(data, client);

        // 2. Create team members if provided
        if (data.members && Array.isArray(data.members) && data.members.length > 0) {
            assignment.members = await repo.createMembers(assignment.id, data.members, client);
        }

        await client.query('COMMIT');
        return assignment;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
};
