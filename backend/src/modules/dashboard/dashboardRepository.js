const { query } = require('../../config/database');

/**
 * Dashboard Repository — aggregated queries for Command Center dashboard
 *
 * Data strategy:
 *   1. Kaji Cepat Awal (rapid_assessments) = initial reports
 *   2. Kaji Cepat Lapangan (field_assessments with detail JSONB) = validated field data
 *   If a rapid_assessment has a corresponding field_assessment (juklak),
 *   the field data takes priority for impact numbers.
 */

// ──────────────── Summary Stats (merged) ────────────────

/**
 * Get all rapid assessments with their rapid-level impact data
 * (affected, refugees, casualties from assessment_* child tables)
 */
const getRapidAssessmentsWithImpact = async () => {
    const result = await query(`
        SELECT
            ra.id,
            ra.disaster_type_id,
            dt.name AS disaster_type_name,
            ra.province,
            ra.regency,
            ra.district,
            ra.waktu_kejadian,
            ra.status,
            ra.created_at,
            -- Aggregated from Kaji Cepat Awal child tables
            COALESCE((SELECT SUM(jumlah_kk) FROM assessment_affected WHERE assessment_id = ra.id), 0) AS kc_terdampak_kk,
            COALESCE((SELECT SUM(jumlah_jiwa) FROM assessment_affected WHERE assessment_id = ra.id), 0) AS kc_terdampak_jiwa,
            COALESCE((SELECT SUM(jumlah_kk) FROM assessment_refugees WHERE assessment_id = ra.id), 0) AS kc_pengungsi_kk,
            COALESCE((SELECT SUM(jumlah_jiwa) FROM assessment_refugees WHERE assessment_id = ra.id), 0) AS kc_pengungsi_jiwa,
            COALESCE((SELECT SUM(jumlah_kk) FROM assessment_casualties WHERE assessment_id = ra.id), 0) AS kc_korban_kk,
            COALESCE((SELECT SUM(jumlah_jiwa) FROM assessment_casualties WHERE assessment_id = ra.id), 0) AS kc_korban_jiwa
        FROM rapid_assessments ra
        JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        WHERE ra.status != 'DRAFT'
        ORDER BY ra.created_at DESC
    `);
    return result.rows;
};

/**
 * Get all field assessments (Juklak) linked to rapid_assessments
 * with their impact data (from legacy sub-tables OR JSONB detail)
 */
const getFieldAssessmentsWithImpact = async () => {
    const result = await query(`
        SELECT
            fa.id AS field_id,
            fa.assessment_id,
            fa.detail,
            fa.status AS field_status,
            fa.assessment_time,
            -- Legacy sub-tables (victims, house_damage)
            v.dead, v.missing, v.severe_injured, v.minor_injured, v.evacuated,
            hd.heavy AS house_heavy, hd.moderate AS house_moderate, hd.light AS house_light,
            fd.school, fd.hospital, fd.worship_place, fd.government_building,
            id.road, id.bridge, id.electricity, id.water, id.telecommunication
        FROM field_assessments fa
        LEFT JOIN victims v ON v.assessment_id = fa.id
        LEFT JOIN house_damage hd ON hd.assessment_id = fa.id
        LEFT JOIN facility_damage fd ON fd.assessment_id = fa.id
        LEFT JOIN infrastructure_damage id ON id.assessment_id = fa.id
        WHERE fa.assessment_id IS NOT NULL
    `);
    return result.rows;
};

// ──────────────── Trend: monthly disaster count ────────────────

const getMonthlyTrend = async (year) => {
    const targetYear = year || new Date().getFullYear();
    const result = await query(`
        SELECT
            EXTRACT(MONTH FROM waktu_kejadian)::int AS month,
            COUNT(*)::int AS total
        FROM rapid_assessments
        WHERE EXTRACT(YEAR FROM waktu_kejadian) = $1
          AND status != 'DRAFT'
        GROUP BY month
        ORDER BY month
    `, [targetYear]);
    return result.rows;
};

// ──────────────── By disaster type ────────────────

const getCountByDisasterType = async () => {
    const result = await query(`
        SELECT dt.name, COUNT(ra.id)::int AS total
        FROM rapid_assessments ra
        JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        WHERE ra.status != 'DRAFT'
        GROUP BY dt.name
        ORDER BY total DESC
    `);
    return result.rows;
};

// ──────────────── Recent events (latest 10) ────────────────

const getRecentEvents = async (limit = 10) => {
    const result = await query(`
        SELECT
            ra.id,
            dt.name AS disaster_type_name,
            ra.district,
            ra.regency,
            ra.province,
            ra.status,
            ra.waktu_kejadian,
            ra.created_at,
            -- Check if field assessment exists
            EXISTS(
                SELECT 1 FROM field_assessments fa
                WHERE fa.assessment_id = ra.id
                  AND fa.detail IS NOT NULL AND fa.detail != '{}'::jsonb
            ) AS has_field_assessment
        FROM rapid_assessments ra
        JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        WHERE ra.status != 'DRAFT'
        ORDER BY ra.created_at DESC
        LIMIT $1
    `, [limit]);
    return result.rows;
};

// ──────────────── By status ────────────────

const getCountByStatus = async () => {
    const result = await query(`
        SELECT status, COUNT(*)::int AS total
        FROM rapid_assessments
        WHERE status != 'DRAFT'
        GROUP BY status
    `);
    return result.rows;
};

// ──────────────── Map points ────────────────

const getMapPoints = async () => {
    const result = await query(`
        SELECT
            ra.id,
            dt.name AS disaster_type_name,
            ra.district,
            ra.regency,
            ra.status,
            ra.waktu_kejadian,
            -- Try to get lat/lng from field_assessment first, fallback to disaster_reports
            COALESCE(
                (SELECT fa.latitude FROM field_assessments fa WHERE fa.assessment_id = ra.id AND fa.latitude IS NOT NULL AND fa.latitude != 0 LIMIT 1),
                (SELECT dr.latitude FROM disaster_reports dr WHERE dr.id = ra.report_id AND dr.latitude IS NOT NULL LIMIT 1)
            ) AS latitude,
            COALESCE(
                (SELECT fa.longitude FROM field_assessments fa WHERE fa.assessment_id = ra.id AND fa.longitude IS NOT NULL AND fa.longitude != 0 LIMIT 1),
                (SELECT dr.longitude FROM disaster_reports dr WHERE dr.id = ra.report_id AND dr.longitude IS NOT NULL LIMIT 1)
            ) AS longitude,
            EXISTS(
                SELECT 1 FROM field_assessments fa
                WHERE fa.assessment_id = ra.id
                  AND fa.detail IS NOT NULL AND fa.detail != '{}'::jsonb
            ) AS has_field_assessment
        FROM rapid_assessments ra
        JOIN disaster_types dt ON ra.disaster_type_id = dt.id
        WHERE ra.status != 'DRAFT'
        ORDER BY ra.created_at DESC
    `);
    return result.rows;
};

module.exports = {
    getRapidAssessmentsWithImpact,
    getFieldAssessmentsWithImpact,
    getMonthlyTrend,
    getCountByDisasterType,
    getRecentEvents,
    getCountByStatus,
    getMapPoints,
};
