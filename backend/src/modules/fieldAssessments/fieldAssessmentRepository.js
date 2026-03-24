const { query, getClient } = require('../../config/database');

/**
 * Field Assessment Repository
 * Updated: Now uses assessment_id (rapid_assessments) instead of report_id (disaster_reports)
 * Added: Juklak-specific CRUD with JSONB detail column
 */

// ──────────────── Original functions (kept for backward compat) ────────────────

const createAssessment = async (data, client) => {
    const dbQuery = client ? client.query.bind(client) : query;

    const { assessment_id, province, regency, district, village, latitude, longitude, assessment_time } = data;
    const result = await dbQuery(`
    INSERT INTO field_assessments 
      (assessment_id, province, regency, district, village, latitude, longitude, location, assessment_time)
    VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($7, $6), 4326), $8)
    RETURNING *
  `, [assessment_id, province, regency, district, village, latitude, longitude, assessment_time || new Date()]);

    return result.rows[0];
};

const createVictims = async (assessmentId, data, client) => {
    const dbQuery = client ? client.query.bind(client) : query;
    const result = await dbQuery(`
    INSERT INTO victims (assessment_id, dead, missing, severe_injured, minor_injured, evacuated)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [assessmentId, data.dead || 0, data.missing || 0, data.severe_injured || 0, data.minor_injured || 0, data.evacuated || 0]);
    return result.rows[0];
};

const createHouseDamage = async (assessmentId, data, client) => {
    const dbQuery = client ? client.query.bind(client) : query;
    const result = await dbQuery(`
    INSERT INTO house_damage (assessment_id, heavy, moderate, light)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [assessmentId, data.heavy || 0, data.moderate || 0, data.light || 0]);
    return result.rows[0];
};

const createFacilityDamage = async (assessmentId, data, client) => {
    const dbQuery = client ? client.query.bind(client) : query;
    const result = await dbQuery(`
    INSERT INTO facility_damage (assessment_id, school, hospital, worship_place, government_building)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [assessmentId, data.school || 0, data.hospital || 0, data.worship_place || 0, data.government_building || 0]);
    return result.rows[0];
};

const createInfrastructureDamage = async (assessmentId, data, client) => {
    const dbQuery = client ? client.query.bind(client) : query;
    const result = await dbQuery(`
    INSERT INTO infrastructure_damage (assessment_id, road, bridge, electricity, water, telecommunication)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [assessmentId, data.road || 0, data.bridge || 0, data.electricity || 0, data.water || 0, data.telecommunication || 0]);
    return result.rows[0];
};

const findByAssessmentId = async (assessmentId) => {
    const assessments = await query(`
    SELECT fa.*, CONCAT('KC-', ra.id) AS report_code
    FROM field_assessments fa
    LEFT JOIN rapid_assessments ra ON fa.assessment_id = ra.id
    WHERE fa.assessment_id = $1
    ORDER BY fa.created_at DESC
  `, [assessmentId]);

    if (assessments.rows.length === 0) return [];

    const result = [];
    for (const asmt of assessments.rows) {
        const [victims, house, facility, infra] = await Promise.all([
            query('SELECT * FROM victims WHERE assessment_id = $1', [asmt.id]),
            query('SELECT * FROM house_damage WHERE assessment_id = $1', [asmt.id]),
            query('SELECT * FROM facility_damage WHERE assessment_id = $1', [asmt.id]),
            query('SELECT * FROM infrastructure_damage WHERE assessment_id = $1', [asmt.id])
        ]);

        result.push({
            ...asmt,
            victims: victims.rows[0] || null,
            house_damage: house.rows[0] || null,
            facility_damage: facility.rows[0] || null,
            infrastructure_damage: infra.rows[0] || null
        });
    }

    return result;
};

const findAll = async () => {
    const assessments = await query(`
    SELECT fa.*, CONCAT('KC-', ra.id) AS report_code, dt.name AS disaster_type,
           ra.status AS report_status
    FROM field_assessments fa
    LEFT JOIN rapid_assessments ra ON fa.assessment_id = ra.id
    LEFT JOIN disaster_types dt ON ra.disaster_type_id = dt.id
    ORDER BY fa.created_at DESC
  `);

    if (assessments.rows.length === 0) return [];

    const result = [];
    for (const asmt of assessments.rows) {
        const [victims, house, facility, infra] = await Promise.all([
            query('SELECT * FROM victims WHERE assessment_id = $1', [asmt.id]),
            query('SELECT * FROM house_damage WHERE assessment_id = $1', [asmt.id]),
            query('SELECT * FROM facility_damage WHERE assessment_id = $1', [asmt.id]),
            query('SELECT * FROM infrastructure_damage WHERE assessment_id = $1', [asmt.id])
        ]);

        result.push({
            ...asmt,
            victims: victims.rows[0] || null,
            house_damage: house.rows[0] || null,
            facility_damage: facility.rows[0] || null,
            infrastructure_damage: infra.rows[0] || null
        });
    }

    return result;
};

// ──────────────── Juklak-specific functions ────────────────

/**
 * Create a Juklak field assessment with full JSONB detail
 */
const createJuklak = async (data) => {
    const result = await query(`
        INSERT INTO field_assessments
            (assessment_id, province, regency, district, village, latitude, longitude,
             location, assessment_time, detail, status, created_by, doc_photos, infographic_path, attachments)
        VALUES ($1, $2, $3, $4, $5, $6, $7,
                ST_SetSRID(ST_MakePoint($7, $6), 4326), $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
    `, [
        data.assessment_id,
        data.province || 'Sulawesi Tengah',
        data.regency || '',
        data.district || '',
        data.village || '',
        data.latitude || 0,
        data.longitude || 0,
        data.assessment_time || new Date(),
        JSON.stringify(data.detail || {}),
        data.status || 'DRAFT',
        data.created_by || null,
        JSON.stringify(data.doc_photos || []),
        data.infographic_path || null,
        JSON.stringify(data.attachments || []),
    ]);
    return result.rows[0];
};

/**
 * Update a Juklak field assessment
 */
const updateJuklak = async (id, data) => {
    const result = await query(`
        UPDATE field_assessments SET
            province = COALESCE($2, province),
            regency = COALESCE($3, regency),
            district = COALESCE($4, district),
            village = COALESCE($5, village),
            latitude = COALESCE($6, latitude),
            longitude = COALESCE($7, longitude),
            assessment_time = COALESCE($8, assessment_time),
            detail = COALESCE($9, detail),
            status = COALESCE($10, status),
            doc_photos = COALESCE($11, doc_photos),
            infographic_path = COALESCE($12, infographic_path),
            attachments = COALESCE($13, attachments)
        WHERE id = $1
        RETURNING *
    `, [
        id,
        data.province || null,
        data.regency || null,
        data.district || null,
        data.village || null,
        data.latitude || null,
        data.longitude || null,
        data.assessment_time || null,
        data.detail ? JSON.stringify(data.detail) : null,
        data.status || null,
        data.doc_photos ? JSON.stringify(data.doc_photos) : null,
        data.infographic_path !== undefined ? data.infographic_path : null,
        data.attachments ? JSON.stringify(data.attachments) : null,
    ]);
    return result.rows[0];
};

/**
 * Get a single Juklak assessment with full detail
 */
const findByIdFull = async (id) => {
    const result = await query(`
        SELECT fa.*,
               CONCAT('KC-', ra.id) AS report_code,
               dt.name AS disaster_type,
               ra.province AS kc_province, ra.regency AS kc_regency,
               ra.district AS kc_district, ra.kronologis AS kc_kronologis,
               ra.waktu_kejadian AS kc_waktu_kejadian,
               ra.status AS kc_status, ra.peta_link AS kc_peta_link,
               u.name AS creator_name
        FROM field_assessments fa
        LEFT JOIN rapid_assessments ra ON fa.assessment_id = ra.id
        LEFT JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        LEFT JOIN users u ON fa.created_by = u.id
        WHERE fa.id = $1
    `, [id]);
    return result.rows[0] || null;
};

/**
 * List all Juklak assessments (summary)
 */
const findAllJuklak = async () => {
    const result = await query(`
        SELECT fa.id, fa.assessment_id, fa.province, fa.regency, fa.district, fa.village,
               fa.status, fa.assessment_time, fa.created_at,
               CONCAT('KC-', ra.id) AS report_code,
               dt.name AS disaster_type,
               u.name AS creator_name
        FROM field_assessments fa
        LEFT JOIN rapid_assessments ra ON fa.assessment_id = ra.id
        LEFT JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        LEFT JOIN users u ON fa.created_by = u.id
        WHERE fa.detail IS NOT NULL AND fa.detail != '{}'::jsonb
        ORDER BY fa.created_at DESC
    `);
    return result.rows;
};

/**
 * Delete a Juklak field assessment
 */
const deleteJuklak = async (id) => {
    const result = await query('DELETE FROM field_assessments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
};

module.exports = {
    createAssessment,
    createVictims,
    createHouseDamage,
    createFacilityDamage,
    createInfrastructureDamage,
    findByAssessmentId,
    findAll,
    // Juklak-specific
    createJuklak,
    updateJuklak,
    findByIdFull,
    findAllJuklak,
    deleteJuklak,
};
