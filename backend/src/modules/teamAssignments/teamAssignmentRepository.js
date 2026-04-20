const { query, getClient } = require('../../config/database');

/**
 * Team Assignment Repository
 * Full CRUD with Surat Tugas (ST) fields integrated.
 */

const findAll = async (filters = {}) => {
    let sql = `
    SELECT ta.*, ra.disaster_type_id, dt.name AS disaster_type,
           ra.regency, ra.district, ra.waktu_kejadian,
           CONCAT('KC-', ra.id) AS report_code
    FROM team_assignments ta
    LEFT JOIN rapid_assessments ra ON ta.assessment_id = ra.id
    LEFT JOIN disaster_types dt ON ra.disaster_type_id = dt.id
  `;
    const params = [];
    const conditions = [];

    if (filters.assessment_id) {
        params.push(filters.assessment_id);
        conditions.push(`ta.assessment_id = $${params.length}`);
    }
    if (filters.status) {
        params.push(filters.status);
        conditions.push(`ta.status = $${params.length}`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY ta.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
};

const findById = async (id) => {
    const result = await query(`
    SELECT ta.*, dt.name AS disaster_type,
           ra.regency, ra.district,
           CONCAT('KC-', ra.id) AS report_code
    FROM team_assignments ta
    LEFT JOIN rapid_assessments ra ON ta.assessment_id = ra.id
    LEFT JOIN disaster_types dt ON ra.disaster_type_id = dt.id
    WHERE ta.id = $1
  `, [id]);
    return result.rows[0] || null;
};

const create = async (data, client) => {
    const dbQuery = client ? client.query.bind(client) : query;

    const {
        assessment_id, team_name, leader, total_members, vehicle,
        departure_time, arrival_estimate,
        nomor_surat, tanggal_surat, bulan_surat, tahun_surat, desa, nama_aparat_desa,
    } = data;

    const result = await dbQuery(`
    INSERT INTO team_assignments 
      (assessment_id, team_name, leader, total_members, vehicle, departure_time, arrival_estimate,
       nomor_surat, tanggal_surat, bulan_surat, tahun_surat, desa, nama_aparat_desa)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
        assessment_id, team_name, leader, total_members,
        vehicle || null, departure_time || null, arrival_estimate || null,
        nomor_surat || null, tanggal_surat || null, bulan_surat || null,
        tahun_surat || null, desa || null, nama_aparat_desa || null,
    ]);

    return result.rows[0];
};

const update = async (id, data, client) => {
    const dbQuery = client ? client.query.bind(client) : query;

    const {
        assessment_id, team_name, leader, total_members, vehicle,
        departure_time, arrival_estimate,
        nomor_surat, tanggal_surat, bulan_surat, tahun_surat, desa, nama_aparat_desa,
    } = data;

    const result = await dbQuery(`
    UPDATE team_assignments SET
      assessment_id = $1, team_name = $2, leader = $3, total_members = $4,
      vehicle = $5, departure_time = $6, arrival_estimate = $7,
      nomor_surat = $8, tanggal_surat = $9, bulan_surat = $10,
      tahun_surat = $11, desa = $12, nama_aparat_desa = $13
    WHERE id = $14
    RETURNING *
  `, [
        assessment_id, team_name, leader, total_members,
        vehicle || null, departure_time || null, arrival_estimate || null,
        nomor_surat || null, tanggal_surat || null, bulan_surat || null,
        tahun_surat || null, desa || null, nama_aparat_desa || null,
        id,
    ]);

    return result.rows[0] || null;
};

const deleteById = async (id) => {
    const result = await query('DELETE FROM team_assignments WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
};

const deleteMembers = async (assignmentId, client) => {
    const dbQuery = client ? client.query.bind(client) : query;
    await dbQuery('DELETE FROM team_members WHERE assignment_id = $1', [assignmentId]);
};

const createMembers = async (assignmentId, members, client) => {
    const dbQuery = client ? client.query.bind(client) : query;
    const created = [];
    for (const member of members) {
        const result = await dbQuery(`
      INSERT INTO team_members (assignment_id, name, division)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [assignmentId, member.name, member.division]);
        created.push(result.rows[0]);
    }
    return created;
};

const findMembersByAssignmentId = async (assignmentId) => {
    const result = await query('SELECT id, name, division FROM team_members WHERE assignment_id = $1 ORDER BY id', [assignmentId]);
    return result.rows;
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteById,
    deleteMembers,
    createMembers,
    findMembersByAssignmentId,
};
