const { query, getClient } = require('../../config/database');

/**
 * Disaster Reports Repository
 */

const findAll = async (filters = {}) => {
    let sql = `
    SELECT dr.id, dr.report_code, dr.disaster_type_id, dt.name AS disaster_type,
           dr.reporter_name, dr.report_source, dr.description,
           dr.latitude, dr.longitude, dr.status, dr.report_time, dr.created_at
    FROM disaster_reports dr
    JOIN disaster_types dt ON dr.disaster_type_id = dt.id
  `;
    const params = [];
    const conditions = [];

    if (filters.status) {
        params.push(filters.status);
        conditions.push(`dr.status = $${params.length}`);
    }
    if (filters.disaster_type_id) {
        params.push(filters.disaster_type_id);
        conditions.push(`dr.disaster_type_id = $${params.length}`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY dr.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
};

const findById = async (id) => {
    const result = await query(`
    SELECT dr.*, dt.name AS disaster_type
    FROM disaster_reports dr
    JOIN disaster_types dt ON dr.disaster_type_id = dt.id
    WHERE dr.id = $1
  `, [id]);
    return result.rows[0] || null;
};

const create = async ({ report_code, disaster_type_id, reporter_name, report_source, description, latitude, longitude, report_time }) => {
    const result = await query(`
    INSERT INTO disaster_reports
      (report_code, disaster_type_id, reporter_name, report_source, description, latitude, longitude, location, status, report_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($7, $6), 4326), 'PENDING', $8)
    RETURNING id, report_code, disaster_type_id, reporter_name, report_source, description, latitude, longitude, status, report_time, created_at
  `, [report_code, disaster_type_id, reporter_name, report_source || null, description || null, latitude, longitude, report_time || new Date()]);
    return result.rows[0];
};

const updateStatus = async (id, status) => {
    const result = await query(
        'UPDATE disaster_reports SET status = $1 WHERE id = $2 RETURNING id, status',
        [status, id]
    );
    return result.rows[0] || null;
};

const generateReportCode = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `RPT-${year}${month}`;

    const result = await query(
        "SELECT COUNT(*) as count FROM disaster_reports WHERE report_code LIKE $1",
        [`${prefix}%`]
    );
    const seq = String(parseInt(result.rows[0].count) + 1).padStart(4, '0');
    return `${prefix}-${seq}`;
};

// ──────────────── Verification Logs ────────────────

const createVerificationLog = async ({ report_id, verified_by, status, notes }) => {
    const result = await query(`
    INSERT INTO verification_logs (report_id, verified_by, status, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING id, report_id, verified_by, status, notes, created_at
  `, [report_id, verified_by, status, notes || null]);
    return result.rows[0];
};

const findVerificationLogsByReportId = async (reportId) => {
    const result = await query(`
    SELECT vl.*, u.name AS verifier_name
    FROM verification_logs vl
    JOIN users u ON vl.verified_by = u.id
    WHERE vl.report_id = $1
    ORDER BY vl.created_at DESC
  `, [reportId]);
    return result.rows;
};

module.exports = {
    findAll,
    findById,
    create,
    updateStatus,
    generateReportCode,
    createVerificationLog,
    findVerificationLogsByReportId,
};
