const repo = require('./teamAssignmentRepository');
const rapidRepo = require('../rapidAssessment/rapidAssessmentRepository');
const { getClient } = require('../../config/database');

/**
 * Team Assignment Service
 * Full CRUD with Surat Tugas fields integrated.
 */

const getAllAssignments = async (filters) => {
    const assignments = await repo.findAll(filters);
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
    const assessment = await rapidRepo.findById(data.assessment_id);
    if (!assessment) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        const assignment = await repo.create(data, client);

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

const updateAssignment = async (id, data) => {
    // Check exists
    const existing = await repo.findById(id);
    if (!existing) {
        const error = new Error('Penugasan tim tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    // If assessment_id changed, validate it
    if (data.assessment_id && data.assessment_id !== existing.assessment_id) {
        const assessment = await rapidRepo.findById(data.assessment_id);
        if (!assessment) {
            const error = new Error('Data kaji cepat tidak ditemukan.');
            error.statusCode = 404;
            throw error;
        }
    }

    // Merge: keep existing values for fields not provided
    const merged = {
        assessment_id: data.assessment_id || existing.assessment_id,
        team_name: data.team_name || existing.team_name,
        leader: data.leader || existing.leader,
        total_members: data.total_members || existing.total_members,
        vehicle: data.vehicle !== undefined ? data.vehicle : existing.vehicle,
        departure_time: data.departure_time !== undefined ? data.departure_time : existing.departure_time,
        arrival_estimate: data.arrival_estimate !== undefined ? data.arrival_estimate : existing.arrival_estimate,
        nomor_surat: data.nomor_surat !== undefined ? data.nomor_surat : existing.nomor_surat,
        tanggal_surat: data.tanggal_surat !== undefined ? data.tanggal_surat : existing.tanggal_surat,
        bulan_surat: data.bulan_surat !== undefined ? data.bulan_surat : existing.bulan_surat,
        tahun_surat: data.tahun_surat !== undefined ? data.tahun_surat : existing.tahun_surat,
        desa: data.desa !== undefined ? data.desa : existing.desa,
        nama_aparat_desa: data.nama_aparat_desa !== undefined ? data.nama_aparat_desa : existing.nama_aparat_desa,
    };

    const client = await getClient();
    try {
        await client.query('BEGIN');

        const updated = await repo.update(id, merged, client);

        // Replace members if provided
        if (data.members && Array.isArray(data.members)) {
            await repo.deleteMembers(id, client);
            if (data.members.length > 0) {
                updated.members = await repo.createMembers(id, data.members, client);
            } else {
                updated.members = [];
            }
        } else {
            updated.members = await repo.findMembersByAssignmentId(id);
        }

        await client.query('COMMIT');
        return updated;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const deleteAssignment = async (id) => {
    const existing = await repo.findById(id);
    if (!existing) {
        const error = new Error('Penugasan tim tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    await repo.deleteById(id);
};

module.exports = {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
};
