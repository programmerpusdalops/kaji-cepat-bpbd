const { query, getClient } = require('../../config/database');

/**
 * Team Assignment Repository
 * Updated: Now uses assessment_id (rapid_assessments) instead of report_id (disaster_reports)
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

const create = async (assignmentData, client) => {
    const dbQuery = client ? client.query.bind(client) : query;

    const { assessment_id, team_name, leader, total_members, vehicle, departure_time, arrival_estimate } = assignmentData;
    const result = await dbQuery(`
    INSERT INTO team_assignments 
      (assessment_id, team_name, leader, total_members, vehicle, departure_time, arrival_estimate)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [assessment_id, team_name, leader, total_members, vehicle || null, departure_time || null, arrival_estimate || null]);

    return result.rows[0];
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
    createMembers,
    findMembersByAssignmentId,
};
