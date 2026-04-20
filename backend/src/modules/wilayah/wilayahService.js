const axios = require('axios');
const repo = require('./wilayahRepository');
const logger = require('../../utils/logger');

const EMSIFA_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const getProvinces = async () => {
    // 1. Cek local database
    let provinces = await repo.getProvinces();
    
    // 2. Jika ada, langsung kembalikan
    if (provinces && provinces.length > 0) {
        return provinces;
    }

    // 3. Jika tidak ada, fetch EMSIFA
    logger.info('[WilayahService] Fetching provinces from EMSIFA...');
    try {
        const response = await axios.get(`${EMSIFA_BASE_URL}/provinces.json`);
        // Format of EMSIFA: [{ id: "11", name: "ACEH" }, ...]
        if (response.data && Array.isArray(response.data)) {
            // 4. Save to DB
            await repo.upsertProvinces(response.data);
            // 5. Query again to ensure consistent sort from DB
            return await repo.getProvinces();
        }
    } catch (error) {
        logger.error(`[WilayahService] Failed to fetch regions from EMSIFA: ${error.message}`);
        throw new Error('Gagal mengambil data provinsi dari sumber eksternal EMSIFA.');
    }
    
    return [];
};

const getRegencies = async (provinceId) => {
    if (!provinceId) throw new Error('Parameter province_id dibutuhkan.');

    let regencies = await repo.getRegencies(provinceId);
    if (regencies && regencies.length > 0) {
        return regencies;
    }

    logger.info(`[WilayahService] Fetching regencies for province ${provinceId} from EMSIFA...`);
    try {
        const response = await axios.get(`${EMSIFA_BASE_URL}/regencies/${provinceId}.json`);
        if (response.data && Array.isArray(response.data)) {
            await repo.upsertRegencies(response.data, provinceId);
            return await repo.getRegencies(provinceId);
        }
    } catch (error) {
        logger.error(`[WilayahService] Failed to fetch regencies from EMSIFA: ${error.message}`);
        // EMSIFA may return 404 if province_id is weird
        throw new Error('Gagal mengambil data kabupaten dari sumber eksternal EMSIFA.');
    }

    return [];
};

const getDistricts = async (regencyId) => {
    if (!regencyId) throw new Error('Parameter regency_id dibutuhkan.');

    let districts = await repo.getDistricts(regencyId);
    if (districts && districts.length > 0) {
        return districts;
    }

    logger.info(`[WilayahService] Fetching districts for regency ${regencyId} from EMSIFA...`);
    try {
        const response = await axios.get(`${EMSIFA_BASE_URL}/districts/${regencyId}.json`);
        if (response.data && Array.isArray(response.data)) {
            await repo.upsertDistricts(response.data, regencyId);
            return await repo.getDistricts(regencyId);
        }
    } catch (error) {
        logger.error(`[WilayahService] Failed to fetch districts from EMSIFA: ${error.message}`);
        throw new Error('Gagal mengambil data kecamatan dari sumber eksternal EMSIFA.');
    }

    return [];
};

const getVillages = async (districtId) => {
    if (!districtId) throw new Error('Parameter district_id dibutuhkan.');

    let villages = await repo.getVillages(districtId);
    if (villages && villages.length > 0) {
        return villages;
    }

    logger.info(`[WilayahService] Fetching villages for district ${districtId} from EMSIFA...`);
    try {
        const response = await axios.get(`${EMSIFA_BASE_URL}/villages/${districtId}.json`);
        if (response.data && Array.isArray(response.data)) {
            await repo.upsertVillages(response.data, districtId);
            return await repo.getVillages(districtId);
        }
    } catch (error) {
        logger.error(`[WilayahService] Failed to fetch villages from EMSIFA: ${error.message}`);
        throw new Error('Gagal mengambil data desa dari sumber eksternal EMSIFA.');
    }

    return [];
};

/**
 * Optional utility to fetch EMSIFA without checking DB
 * used for forceful sync
 */
const syncAllDataSulteng = async () => {
    // Sulteng ID is 72
    const PROVINCE_ID = '72';

    // Ensure we have provinces
    await getProvinces();
    
    // Fetch and save Regencies for Sulteng
    const regencies = await axios.get(`${EMSIFA_BASE_URL}/regencies/${PROVINCE_ID}.json`);
    await repo.upsertRegencies(regencies.data, PROVINCE_ID);

    // Fetch and save Districts for all Sulteng Regencies
    for (const r of regencies.data) {
        const dists = await axios.get(`${EMSIFA_BASE_URL}/districts/${r.id}.json`);
        await repo.upsertDistricts(dists.data, r.id);

        // Fetch and save Villages for all those Districts
        for (const d of dists.data) {
            try {
                const vils = await axios.get(`${EMSIFA_BASE_URL}/villages/${d.id}.json`);
                await repo.upsertVillages(vils.data, d.id);
            } catch (err) {
                logger.error(`Failed dropping villages for district ${d.id}: ${err.message}`);
            }
        }
    }

    return { success: true, message: 'Sync wilayah seluruh Sulawesi Tengah selesai' };
};

module.exports = {
    getProvinces,
    getRegencies,
    getDistricts,
    getVillages,
    syncAllDataSulteng
};
