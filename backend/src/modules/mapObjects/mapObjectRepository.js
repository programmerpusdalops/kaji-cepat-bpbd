const { query } = require('../../config/database');

/**
 * Map Object Repository — database queries for collaborative map objects
 * Updated: Now uses assessment_id (rapid_assessments) instead of disaster_id (disaster_reports)
 */

/**
 * Get all map objects for an assessment as rows
 */
const findByAssessmentId = async (assessmentId) => {
    const result = await query(
        `SELECT mo.*, u.name AS creator_name
         FROM map_objects mo
         LEFT JOIN users u ON mo.created_by = u.id
         WHERE mo.assessment_id = $1
         ORDER BY mo.created_at DESC`,
        [assessmentId]
    );
    return result.rows;
};

/**
 * Backward compat: find by disaster_id (for old data)
 */
const findByDisasterId = async (disasterId) => {
    const result = await query(
        `SELECT mo.*, u.name AS creator_name
         FROM map_objects mo
         LEFT JOIN users u ON mo.created_by = u.id
         WHERE mo.disaster_id = $1
         ORDER BY mo.created_at DESC`,
        [disasterId]
    );
    return result.rows;
};

/**
 * Get single map object by ID
 */
const findById = async (id) => {
    const result = await query(
        `SELECT mo.*, u.name AS creator_name
         FROM map_objects mo
         LEFT JOIN users u ON mo.created_by = u.id
         WHERE mo.id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

/**
 * Create a new map object (now uses assessment_id)
 */
const create = async ({ assessment_id, disaster_id, type, title, description, category, geometry, photo_path, status, created_by }) => {
    const result = await query(
        `INSERT INTO map_objects (assessment_id, disaster_id, type, title, description, category, geometry, photo_path, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [assessment_id || null, disaster_id || null, type, title, description || null, category || null, JSON.stringify(geometry), photo_path || null, status || 'aktif', created_by]
    );
    return result.rows[0];
};

/**
 * Update a map object
 */
const update = async (id, { title, description, category, geometry, photo_path, status }) => {
    const result = await query(
        `UPDATE map_objects
         SET title = $1, description = $2, category = $3, geometry = $4, photo_path = COALESCE($5, photo_path), status = $6
         WHERE id = $7
         RETURNING *`,
        [title, description || null, category || null, JSON.stringify(geometry), photo_path || null, status || 'aktif', id]
    );
    return result.rows[0] || null;
};

/**
 * Delete a map object
 */
const remove = async (id) => {
    const result = await query(
        'DELETE FROM map_objects WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] || null;
};

/**
 * Get assessment info for map context (replaces findDisasterInfo)
 */
const findAssessmentInfo = async (assessmentId) => {
    const result = await query(
        `SELECT ra.id, CONCAT('KC-', ra.id) AS report_code, ra.kronologis AS description,
                ra.province, ra.regency, ra.district,
                ra.waktu_kejadian AS report_time, ra.status,
                dt.name AS disaster_type
         FROM rapid_assessments ra
         LEFT JOIN disaster_types dt ON ra.disaster_type_id = dt.id
         WHERE ra.id = $1`,
        [assessmentId]
    );
    return result.rows[0] || null;
};

/**
 * Backward compat: Get disaster report info
 */
const findDisasterInfo = async (disasterId) => {
    const result = await query(
        `SELECT dr.id, dr.report_code, dr.description, dr.latitude, dr.longitude, dr.status, dr.report_time,
                dt.name AS disaster_type
         FROM disaster_reports dr
         LEFT JOIN disaster_types dt ON dr.disaster_type_id = dt.id
         WHERE dr.id = $1`,
        [disasterId]
    );
    return result.rows[0] || null;
};

/**
 * Get unique categories for an assessment
 */
const findCategoriesByAssessment = async (assessmentId) => {
    const result = await query(
        `SELECT DISTINCT category FROM map_objects WHERE assessment_id = $1 AND category IS NOT NULL ORDER BY category`,
        [assessmentId]
    );
    return result.rows.map(r => r.category);
};

/**
 * Backward compat: categories by disaster_id
 */
const findCategoriesByDisaster = async (disasterId) => {
    const result = await query(
        `SELECT DISTINCT category FROM map_objects WHERE disaster_id = $1 AND category IS NOT NULL ORDER BY category`,
        [disasterId]
    );
    return result.rows.map(r => r.category);
};

module.exports = {
    findByAssessmentId,
    findByDisasterId,
    findById,
    create,
    update,
    remove,
    findAssessmentInfo,
    findDisasterInfo,
    findCategoriesByAssessment,
    findCategoriesByDisaster,
};
