const { query } = require('../../config/database');

/**
 * Master Data Repository — queries for disaster_types, agencies, regions
 */

// ──────────────── Disaster Types ────────────────

const findAllDisasterTypes = async () => {
    const result = await query('SELECT id, name FROM disaster_types ORDER BY id');
    return result.rows;
};

const findDisasterTypeById = async (id) => {
    const result = await query('SELECT id, name FROM disaster_types WHERE id = $1', [id]);
    return result.rows[0] || null;
};

const createDisasterType = async (name) => {
    const result = await query(
        'INSERT INTO disaster_types (name) VALUES ($1) RETURNING id, name',
        [name]
    );
    return result.rows[0];
};

const updateDisasterType = async (id, name) => {
    const result = await query(
        'UPDATE disaster_types SET name = $1 WHERE id = $2 RETURNING id, name',
        [name, id]
    );
    return result.rows[0] || null;
};

const deleteDisasterType = async (id) => {
    const result = await query('DELETE FROM disaster_types WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
};

const countReportsByDisasterTypeId = async (id) => {
    const result = await query('SELECT COUNT(*)::int AS count FROM disaster_reports WHERE disaster_type_id = $1', [id]);
    return result.rows[0].count;
};

// ──────────────── Agencies ────────────────

const findAllAgencies = async () => {
    const result = await query('SELECT id, name, type FROM agencies ORDER BY id');
    return result.rows;
};

const createAgency = async (name, type) => {
    const result = await query(
        'INSERT INTO agencies (name, type) VALUES ($1, $2) RETURNING id, name, type',
        [name, type || null]
    );
    return result.rows[0];
};

const updateAgency = async (id, name, type) => {
    const result = await query(
        'UPDATE agencies SET name = $1, type = $2 WHERE id = $3 RETURNING id, name, type',
        [name, type || null, id]
    );
    return result.rows[0] || null;
};

const deleteAgency = async (id) => {
    const result = await query('DELETE FROM agencies WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
};

const findAgencyById = async (id) => {
    const result = await query('SELECT id, name, type FROM agencies WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// ──────────────── Regions ────────────────

const findAllRegions = async () => {
    const result = await query('SELECT id, province, regency, district, village FROM regions ORDER BY province, regency, district, village');
    return result.rows;
};

const findRegionsByProvince = async (province) => {
    const result = await query(
        'SELECT DISTINCT regency FROM regions WHERE province = $1 ORDER BY regency',
        [province]
    );
    return result.rows;
};

const findDistrictsByRegency = async (regency) => {
    const result = await query(
        'SELECT DISTINCT district FROM regions WHERE regency = $1 ORDER BY district',
        [regency]
    );
    return result.rows;
};

const findVillagesByDistrict = async (district) => {
    const result = await query(
        'SELECT DISTINCT village FROM regions WHERE district = $1 ORDER BY village',
        [district]
    );
    return result.rows;
};

const createRegion = async (province, regency, district, village) => {
    const result = await query(
        'INSERT INTO regions (province, regency, district, village) VALUES ($1, $2, $3, $4) RETURNING id, province, regency, district, village',
        [province, regency || null, district || null, village || null]
    );
    return result.rows[0];
};

const updateRegion = async (id, province, regency, district, village) => {
    const result = await query(
        'UPDATE regions SET province = $1, regency = $2, district = $3, village = $4 WHERE id = $5 RETURNING id, province, regency, district, village',
        [province, regency || null, district || null, village || null, id]
    );
    return result.rows[0] || null;
};

const deleteRegion = async (id) => {
    const result = await query('DELETE FROM regions WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
};

// ──────────────── Need Items ────────────────

const findAllNeedItems = async () => {
    const result = await query('SELECT id, name, unit FROM need_items ORDER BY id');
    return result.rows;
};

const createNeedItem = async (name, unit) => {
    const result = await query(
        'INSERT INTO need_items (name, unit) VALUES ($1, $2) RETURNING id, name, unit',
        [name, unit || null]
    );
    return result.rows[0];
};

const updateNeedItem = async (id, name, unit) => {
    const result = await query(
        'UPDATE need_items SET name = $1, unit = $2 WHERE id = $3 RETURNING id, name, unit',
        [name, unit || null, id]
    );
    return result.rows[0] || null;
};

const deleteNeedItem = async (id) => {
    const result = await query('DELETE FROM need_items WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
};

module.exports = {
    findAllDisasterTypes,
    findDisasterTypeById,
    createDisasterType,
    updateDisasterType,
    deleteDisasterType,
    countReportsByDisasterTypeId,
    findAllAgencies,
    findAgencyById,
    createAgency,
    updateAgency,
    deleteAgency,
    findAllRegions,
    findRegionsByProvince,
    findDistrictsByRegency,
    findVillagesByDistrict,
    createRegion,
    updateRegion,
    deleteRegion,
    findAllNeedItems,
    createNeedItem,
    updateNeedItem,
    deleteNeedItem,
};
