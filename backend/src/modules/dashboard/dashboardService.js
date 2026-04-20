const repo = require('./dashboardRepository');
const logger = require('../../utils/logger');

/**
 * Dashboard Service — business logic for Command Center analytics
 *
 * Core strategy: merge Kaji Cepat Awal (rapid_assessments) data
 * with Kaji Cepat Lapangan (field_assessments Juklak) data.
 * Field assessment data takes priority when available.
 */

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

// Curated color palette for disaster types
const TYPE_COLORS = [
    '#F97316', // orange
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#6366F1', // indigo
    '#14B8A6', // teal
];

/**
 * Extract impact data from a Juklak field assessment's JSONB detail column.
 * The detail structure has sections like:
 *   detail.dampak.korban_jiwa (array of { uraian, lk, pr, jumlah })
 *   detail.dampak.kerusakan_rumah (array)
 *   detail.dampak.kerusakan_infrastruktur (array)
 */
const extractFieldImpact = (fieldRow) => {
    let dead = 0, missing = 0, severeInjured = 0, minorInjured = 0, evacuated = 0;
    let houseHeavy = 0, houseModerate = 0, houseLight = 0;
    let affectedKk = 0, affectedJiwa = 0;
    let refugeesKk = 0, refugeesJiwa = 0;

    // First check legacy sub-tables (victims, house_damage)
    if (fieldRow.dead !== null && fieldRow.dead !== undefined) {
        dead = fieldRow.dead || 0;
        missing = fieldRow.missing || 0;
        severeInjured = fieldRow.severe_injured || 0;
        minorInjured = fieldRow.minor_injured || 0;
        evacuated = fieldRow.evacuated || 0;
    }
    if (fieldRow.house_heavy !== null && fieldRow.house_heavy !== undefined) {
        houseHeavy = fieldRow.house_heavy || 0;
        houseModerate = fieldRow.house_moderate || 0;
        houseLight = fieldRow.house_light || 0;
    }

    // Then override from JSONB detail if available (Juklak format)
    const detail = fieldRow.detail;
    if (detail && typeof detail === 'object') {
        
        // 1. Support for CURRENT frontend format (dari FieldAssessmentPage.tsx terkini)
        if (detail.korban) {
            dead = parseInt(detail.korban.meninggal) || dead;
            missing = parseInt(detail.korban.hilang) || missing;
            minorInjured = parseInt(detail.korban.luka) || minorInjured;
            severeInjured = parseInt(detail.korban.sakit) || severeInjured;
        }

        if (detail.pengungsi) {
            refugeesKk = parseInt(detail.pengungsi.jumlah_kk) || refugeesKk;
            refugeesJiwa = parseInt(detail.pengungsi.total) || refugeesJiwa;
            evacuated = refugeesJiwa;
        }

        if (detail.penduduk_terdampak) {
            affectedJiwa = parseInt(detail.penduduk_terdampak.total) || affectedJiwa;
        }

        if (detail.kerusakan) {
            // Rumah tidak layak huni -> Rusak Berat (Heavy)
            houseHeavy = parseInt(detail.kerusakan.rumah_tidak_layak) || houseHeavy;
            
            // Rumah terdampak (total) dikurangi yang rusak berat = rusak ringan
            const totalTerdampak = parseInt(detail.kerusakan.rumah_terdampak) || 0;
            // Jika total rumah terdampak >= rumah rusak berat, sisanya dianggap rusak ringan (light)
            if (totalTerdampak >= houseHeavy && totalTerdampak > 0) {
                houseLight = totalTerdampak - houseHeavy;
            } else if (totalTerdampak > 0) {
                houseLight = totalTerdampak;
            }
        }

        // 2. Support for OLDER prototype JSON format (dampak.*)
        const dampak = detail.dampak;
        if (dampak) {
            // korban_jiwa: array of { uraian, lk, pr, jumlah }
            if (Array.isArray(dampak.korban_jiwa)) {
                for (const item of dampak.korban_jiwa) {
                    const uraian = (item.uraian || '').toLowerCase();
                    const jumlah = parseInt(item.jumlah) || 0;
                    if (uraian.includes('meninggal')) dead = jumlah;
                    else if (uraian.includes('hilang')) missing = jumlah;
                    else if (uraian.includes('luka berat')) severeInjured = jumlah;
                    else if (uraian.includes('luka ringan')) minorInjured = jumlah;
                }
            }

            // pengungsi
            if (Array.isArray(dampak.pengungsi)) {
                for (const item of dampak.pengungsi) {
                    refugeesKk += parseInt(item.kk) || 0;
                    refugeesJiwa += parseInt(item.jiwa) || 0;
                }
            } else if (dampak.pengungsi_kk || dampak.pengungsi_jiwa) {
                refugeesKk = parseInt(dampak.pengungsi_kk) || refugeesKk;
                refugeesJiwa = parseInt(dampak.pengungsi_jiwa) || refugeesJiwa;
            }

            // terdampak
            if (Array.isArray(dampak.terdampak)) {
                for (const item of dampak.terdampak) {
                    affectedKk += parseInt(item.kk) || 0;
                    affectedJiwa += parseInt(item.jiwa) || 0;
                }
            }

            // kerusakan rumah: array of { tingkat_kerusakan, jumlah }
            if (Array.isArray(dampak.kerusakan_rumah)) {
                for (const item of dampak.kerusakan_rumah) {
                    const tingkat = (item.tingkat_kerusakan || item.uraian || '').toLowerCase();
                    const jumlah = parseInt(item.jumlah) || 0;
                    if (tingkat.includes('berat') || tingkat.includes('heavy')) houseHeavy = jumlah;
                    else if (tingkat.includes('sedang') || tingkat.includes('moderate')) houseModerate = jumlah;
                    else if (tingkat.includes('ringan') || tingkat.includes('light')) houseLight = jumlah;
                }
            }

            // If evacuated comes from JSONB
            if (dampak.pengungsi_jiwa) {
                evacuated = parseInt(dampak.pengungsi_jiwa) || evacuated;
            } else if (refugeesJiwa > 0) {
                evacuated = refugeesJiwa;
            }
        }
    }

    return {
        dead, missing, severeInjured, minorInjured, evacuated,
        houseHeavy, houseModerate, houseLight,
        affectedKk, affectedJiwa,
        refugeesKk, refugeesJiwa,
    };
};

/**
 * Main dashboard data aggregator
 */
const getDashboardData = async () => {
    try {
        // Fetch all data in parallel
        const [
            rapidData,
            fieldData,
            monthlyTrend,
            byType,
            recentEvents,
            byStatus,
            mapPoints,
        ] = await Promise.all([
            repo.getRapidAssessmentsWithImpact(),
            repo.getFieldAssessmentsWithImpact(),
            repo.getMonthlyTrend(),
            repo.getCountByDisasterType(),
            repo.getRecentEvents(),
            repo.getCountByStatus(),
            repo.getMapPoints(),
        ]);

        // Build field assessment lookup (assessment_id -> field impact data)
        const fieldLookup = {};
        for (const fd of fieldData) {
            if (!fd.assessment_id) continue;
            const impact = extractFieldImpact(fd);
            // If multiple field assessments per rapid, sum them
            if (fieldLookup[fd.assessment_id]) {
                const existing = fieldLookup[fd.assessment_id];
                existing.dead += impact.dead;
                existing.missing += impact.missing;
                existing.severeInjured += impact.severeInjured;
                existing.minorInjured += impact.minorInjured;
                existing.evacuated += impact.evacuated;
                existing.houseHeavy += impact.houseHeavy;
                existing.houseModerate += impact.houseModerate;
                existing.houseLight += impact.houseLight;
                existing.affectedKk += impact.affectedKk;
                existing.affectedJiwa += impact.affectedJiwa;
                existing.refugeesKk += impact.refugeesKk;
                existing.refugeesJiwa += impact.refugeesJiwa;
            } else {
                fieldLookup[fd.assessment_id] = impact;
            }
        }

        // Merge: prioritize field data, fallback to rapid data
        let totalDead = 0, totalMissing = 0, totalSevereInjured = 0, totalMinorInjured = 0;
        let totalEvacuated = 0;
        let totalHouseHeavy = 0, totalHouseModerate = 0, totalHouseLight = 0;
        let totalAffectedKk = 0, totalAffectedJiwa = 0;
        let totalRefugeesKk = 0, totalRefugeesJiwa = 0;
        let fieldVerifiedCount = 0;

        for (const rapid of rapidData) {
            const field = fieldLookup[rapid.id];
            if (field) {
                // Use field data (more valid)
                fieldVerifiedCount++;
                totalDead += field.dead;
                totalMissing += field.missing;
                totalSevereInjured += field.severeInjured;
                totalMinorInjured += field.minorInjured;
                totalEvacuated += field.evacuated;
                totalHouseHeavy += field.houseHeavy;
                totalHouseModerate += field.houseModerate;
                totalHouseLight += field.houseLight;
                totalAffectedKk += field.affectedKk;
                totalAffectedJiwa += field.affectedJiwa;
                totalRefugeesKk += field.refugeesKk;
                totalRefugeesJiwa += field.refugeesJiwa;
            } else {
                // Use rapid (initial) data
                totalAffectedKk += parseInt(rapid.kc_terdampak_kk) || 0;
                totalAffectedJiwa += parseInt(rapid.kc_terdampak_jiwa) || 0;
                totalRefugeesKk += parseInt(rapid.kc_pengungsi_kk) || 0;
                totalRefugeesJiwa += parseInt(rapid.kc_pengungsi_jiwa) || 0;
                totalDead += parseInt(rapid.kc_korban_kk) || 0;
                totalEvacuated += parseInt(rapid.kc_pengungsi_jiwa) || 0;
            }
        }

        const totalDisaster = rapidData.length;
        const totalVictims = totalDead + totalMissing + totalSevereInjured + totalMinorInjured;
        const totalRefugees = totalRefugeesJiwa || totalEvacuated;
        const totalHouseDamage = totalHouseHeavy + totalHouseModerate + totalHouseLight;

        // Format monthly trend (fill all 12 months)
        const trendMap = {};
        for (const row of monthlyTrend) {
            trendMap[row.month] = row.total;
        }
        const trend = [];
        for (let m = 1; m <= 12; m++) {
            trend.push({
                month: MONTH_NAMES[m - 1],
                kejadian: trendMap[m] || 0,
            });
        }

        // Format disaster type distribution with stable colors
        const disasterByType = byType.map((item, i) => ({
            name: item.name,
            value: item.total,
            color: TYPE_COLORS[i % TYPE_COLORS.length],
        }));

        // Format status distribution
        const statusMap = {};
        for (const row of byStatus) {
            statusMap[row.status] = row.total;
        }

        // Format recent events
        const recent = recentEvents.map(e => ({
            id: e.id,
            disaster_type: e.disaster_type_name,
            location: [e.district, e.regency].filter(Boolean).join(', '),
            status: e.status,
            waktu_kejadian: e.waktu_kejadian,
            created_at: e.created_at,
            has_field_assessment: e.has_field_assessment,
        }));

        // Format map points (filter out those without coordinates)
        const points = mapPoints
            .filter(p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0)
            .map(p => ({
                id: p.id,
                lat: parseFloat(p.latitude),
                lng: parseFloat(p.longitude),
                jenis_bencana: p.disaster_type_name,
                status: p.status,
                lokasi: [p.district, p.regency].filter(Boolean).join(', '),
                has_field_assessment: p.has_field_assessment,
            }));

        // Data verification percentage
        const verificationRate = totalDisaster > 0
            ? Math.round((fieldVerifiedCount / totalDisaster) * 100)
            : 0;

        return {
            stats: {
                total_disaster: totalDisaster,
                total_victims: totalVictims,
                total_refugees: totalRefugees,
                total_house_damage: totalHouseDamage,
                total_affected_kk: totalAffectedKk,
                total_affected_jiwa: totalAffectedJiwa,
            },
            victims_detail: {
                dead: totalDead,
                missing: totalMissing,
                severe_injured: totalSevereInjured,
                minor_injured: totalMinorInjured,
            },
            house_damage_detail: {
                heavy: totalHouseHeavy,
                moderate: totalHouseModerate,
                light: totalHouseLight,
            },
            refugees_detail: {
                kk: totalRefugeesKk,
                jiwa: totalRefugeesJiwa,
            },
            verification: {
                total: totalDisaster,
                field_verified: fieldVerifiedCount,
                pending_verification: totalDisaster - fieldVerifiedCount,
                rate: verificationRate,
            },
            by_status: statusMap,
            by_type: disasterByType,
            trend,
            recent_events: recent,
            map_points: points,
        };
    } catch (error) {
        logger.error('Dashboard aggregation error:', error);
        throw error;
    }
};

module.exports = {
    getDashboardData,
};
