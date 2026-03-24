const repo = require('./masterDataRepository');

/**
 * Master Data Service — business logic
 */

// ──────────────── Combined Master Data ────────────────

const getAllMasterData = async () => {
    const [disasterTypes, agencies, regions, needItems] = await Promise.all([
        repo.findAllDisasterTypes(),
        repo.findAllAgencies(),
        repo.findAllRegions(),
        repo.findAllNeedItems(),
    ]);
    return { disaster_types: disasterTypes, agencies, regions, need_items: needItems };
};

// ──────────────── Disaster Types ────────────────

const getAllDisasterTypes = async () => repo.findAllDisasterTypes();

const createDisasterType = async (name) => {
    return await repo.createDisasterType(name);
};

const updateDisasterType = async (id, name) => {
    const result = await repo.updateDisasterType(id, name);
    if (!result) {
        const error = new Error('Jenis bencana tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

const deleteDisasterType = async (id) => {
    // Check FK constraint — is this disaster type used by any reports?
    const reportCount = await repo.countReportsByDisasterTypeId(id);
    if (reportCount > 0) {
        const error = new Error(`Jenis bencana tidak dapat dihapus karena masih digunakan oleh ${reportCount} laporan bencana.`);
        error.statusCode = 409;
        throw error;
    }

    const result = await repo.deleteDisasterType(id);
    if (!result) {
        const error = new Error('Jenis bencana tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

// ──────────────── Agencies ────────────────

const getAllAgencies = async () => repo.findAllAgencies();
const createAgency = async (name, type) => repo.createAgency(name, type);

const updateAgency = async (id, name, type) => {
    const result = await repo.updateAgency(id, name, type);
    if (!result) {
        const error = new Error('Instansi tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

const deleteAgency = async (id) => {
    const result = await repo.deleteAgency(id);
    if (!result) {
        const error = new Error('Instansi tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

// ──────────────── Regions ────────────────

const getAllRegions = async () => repo.findAllRegions();
const getRegenciesByProvince = async (province) => repo.findRegionsByProvince(province);
const getDistrictsByRegency = async (regency) => repo.findDistrictsByRegency(regency);
const getVillagesByDistrict = async (district) => repo.findVillagesByDistrict(district);

const createRegion = async (province, regency, district, village) => {
    return await repo.createRegion(province, regency, district, village);
};

const updateRegion = async (id, province, regency, district, village) => {
    const result = await repo.updateRegion(id, province, regency, district, village);
    if (!result) {
        const error = new Error('Data wilayah tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

const deleteRegion = async (id) => {
    const result = await repo.deleteRegion(id);
    if (!result) {
        const error = new Error('Data wilayah tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

// ──────────────── Need Items ────────────────

const getAllNeedItems = async () => repo.findAllNeedItems();

const createNeedItem = async (name, unit) => {
    return await repo.createNeedItem(name, unit);
};

const updateNeedItem = async (id, name, unit) => {
    const result = await repo.updateNeedItem(id, name, unit);
    if (!result) {
        const error = new Error('Item kebutuhan tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

const deleteNeedItem = async (id) => {
    const result = await repo.deleteNeedItem(id);
    if (!result) {
        const error = new Error('Item kebutuhan tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return result;
};

module.exports = {
    getAllMasterData,
    getAllDisasterTypes,
    createDisasterType,
    updateDisasterType,
    deleteDisasterType,
    getAllAgencies,
    createAgency,
    updateAgency,
    deleteAgency,
    getAllRegions,
    getRegenciesByProvince,
    getDistrictsByRegency,
    getVillagesByDistrict,
    createRegion,
    updateRegion,
    deleteRegion,
    getAllNeedItems,
    createNeedItem,
    updateNeedItem,
    deleteNeedItem,
};
