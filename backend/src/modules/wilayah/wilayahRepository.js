const { pool } = require('../../config/database');

// --- PROVINCES ---
const upsertProvinces = async (provinces) => {
    if (!provinces || provinces.length === 0) return;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = `
            INSERT INTO provinces (id, name)
            VALUES ($1, $2)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, created_at = CURRENT_TIMESTAMP
        `;
        for (const p of provinces) {
            await client.query(query, [p.id, p.name]);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getProvinces = async () => {
    const result = await pool.query('SELECT id, name FROM provinces ORDER BY name ASC');
    return result.rows;
};

// --- REGENCIES ---
const upsertRegencies = async (regencies, provinceId) => {
    if (!regencies || regencies.length === 0) return;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = `
            INSERT INTO regencies (id, province_id, name)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, province_id = EXCLUDED.province_id, created_at = CURRENT_TIMESTAMP
        `;
        for (const r of regencies) {
            await client.query(query, [r.id, provinceId, r.name]);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getRegencies = async (provinceId) => {
    const result = await pool.query(
        'SELECT id, province_id, name FROM regencies WHERE province_id = $1 ORDER BY name ASC',
        [provinceId]
    );
    return result.rows;
};

// --- DISTRICTS ---
const upsertDistricts = async (districts, regencyId) => {
    if (!districts || districts.length === 0) return;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = `
            INSERT INTO districts (id, regency_id, name)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, regency_id = EXCLUDED.regency_id, created_at = CURRENT_TIMESTAMP
        `;
        for (const d of districts) {
            await client.query(query, [d.id, regencyId, d.name]);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getDistricts = async (regencyId) => {
    const result = await pool.query(
        'SELECT id, regency_id, name FROM districts WHERE regency_id = $1 ORDER BY name ASC',
        [regencyId]
    );
    return result.rows;
};

// --- VILLAGES ---
const upsertVillages = async (villages, districtId) => {
    if (!villages || villages.length === 0) return;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = `
            INSERT INTO villages (id, district_id, name)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, district_id = EXCLUDED.district_id, created_at = CURRENT_TIMESTAMP
        `;
        for (const v of villages) {
            await client.query(query, [v.id, districtId, v.name]);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getVillages = async (districtId) => {
    const result = await pool.query(
        'SELECT id, district_id, name FROM villages WHERE district_id = $1 ORDER BY name ASC',
        [districtId]
    );
    return result.rows;
};

module.exports = {
    upsertProvinces,
    getProvinces,
    upsertRegencies,
    getRegencies,
    upsertDistricts,
    getDistricts,
    upsertVillages,
    getVillages
};
