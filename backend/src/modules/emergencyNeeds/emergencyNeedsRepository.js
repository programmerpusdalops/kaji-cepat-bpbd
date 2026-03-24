const { query } = require('../../config/database');

/**
 * Emergency Needs Repository
 */

const createOrUpdate = async (data, clientInstance) => {
    const { assessment_id, needs } = data;
    const dbClient = clientInstance || query; // In a real app we'd use transactions via client
    
    // Check if assessment already has an emergency_needs record
    const existing = await dbClient('SELECT id FROM emergency_needs WHERE assessment_id = $1', [assessment_id]);
    
    let emergencyNeedId;
    if (existing && existing.rows && existing.rows.length > 0) {
        emergencyNeedId = existing.rows[0].id;
    } else {
        const result = await dbClient(`
            INSERT INTO emergency_needs (assessment_id)
            VALUES ($1) RETURNING id
        `, [assessment_id]);
        emergencyNeedId = result.rows[0].id;
    }

    // Clear old details if any
    await dbClient('DELETE FROM emergency_need_details WHERE emergency_need_id = $1', [emergencyNeedId]);

    // Insert new details
    if (needs && Array.isArray(needs)) {
        for (const need of needs) {
            await dbClient(`
                INSERT INTO emergency_need_details (emergency_need_id, need_item_id, quantity)
                VALUES ($1, $2, $3)
            `, [emergencyNeedId, need.item_id, need.quantity]);
        }
    }

    return await findByAssessmentId(assessment_id, dbClient);
};

const findByAssessmentId = async (assessmentId, clientInstance) => {
    const dbClient = clientInstance || query;
    const result = await dbClient('SELECT * FROM emergency_needs WHERE assessment_id = $1', [assessmentId]);
    if (result.rows.length === 0) return null;

    const record = result.rows[0];
    const details = await dbClient(`
        SELECT d.quantity, i.id as item_id, i.name as item_name, i.unit
        FROM emergency_need_details d
        JOIN need_items i ON d.need_item_id = i.id
        WHERE d.emergency_need_id = $1
    `, [record.id]);
    
    return { ...record, needs: details.rows };
};

// Also fetch by report_id directly spanning assessments for dashboard/frontend convenience
const findByReportId = async (reportId) => {
    const result = await query(`
    SELECT en.*, fa.province, fa.regency, fa.district, fa.village
    FROM emergency_needs en
    JOIN field_assessments fa ON en.assessment_id = fa.id
    WHERE fa.report_id = $1
    ORDER BY en.created_at DESC
  `, [reportId]);

    if (result.rows.length === 0) return [];
    
    const list = result.rows;
    for (const record of list) {
        const details = await query(`
            SELECT d.quantity, i.id as item_id, i.name as item_name, i.unit
            FROM emergency_need_details d
            JOIN need_items i ON d.need_item_id = i.id
            WHERE d.emergency_need_id = $1
        `, [record.id]);
        record.needs = details.rows;
    }
    
    return list;
};

const findAll = async () => {
    // Getting an overview of emergency needs across all reports
    const result = await query(`
        SELECT en.*, dr.report_code, dt.name as disaster_type, fa.province, fa.regency, fa.district, fa.village, dr.id as report_id
        FROM emergency_needs en
        JOIN field_assessments fa ON en.assessment_id = fa.id
        JOIN disaster_reports dr ON fa.report_id = dr.id
        JOIN disaster_types dt ON dr.disaster_type_id = dt.id
        ORDER BY en.created_at DESC
    `);

    const list = result.rows;
    for (const record of list) {
        const details = await query(`
            SELECT d.quantity, i.id as item_id, i.name as item_name, i.unit
            FROM emergency_need_details d
            JOIN need_items i ON d.need_item_id = i.id
            WHERE d.emergency_need_id = $1
        `, [record.id]);
        record.needs = details.rows;
    }
    
    return list;
};

module.exports = {
    createOrUpdate,
    findByAssessmentId,
    findByReportId,
    findAll
};
