const { validationResult } = require('express-validator');
const service = require('./masterDataService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

/**
 * Master Data Controller
 */

// ──────────────── Combined ────────────────

const getAll = async (req, res, next) => {
    try {
        const data = await service.getAllMasterData();
        return successResponse(res, 'Master data berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

// ──────────────── Disaster Types ────────────────

const getDisasterTypes = async (req, res, next) => {
    try {
        const data = await service.getAllDisasterTypes();
        return successResponse(res, 'Jenis bencana berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const createDisasterType = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.createDisasterType(req.body.name);
        return successResponse(res, 'Jenis bencana berhasil ditambahkan.', data, 201);
    } catch (error) {
        next(error);
    }
};

const updateDisasterType = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.updateDisasterType(parseInt(req.params.id), req.body.name);
        return successResponse(res, 'Jenis bencana berhasil diperbarui.', data);
    } catch (error) {
        next(error);
    }
};

const deleteDisasterType = async (req, res, next) => {
    try {
        await service.deleteDisasterType(parseInt(req.params.id));
        return successResponse(res, 'Jenis bencana berhasil dihapus.');
    } catch (error) {
        next(error);
    }
};

// ──────────────── Agencies ────────────────

const getAgencies = async (req, res, next) => {
    try {
        const data = await service.getAllAgencies();
        return successResponse(res, 'Daftar instansi berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const createAgency = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.createAgency(req.body.name, req.body.type);
        return successResponse(res, 'Instansi berhasil ditambahkan.', data, 201);
    } catch (error) {
        next(error);
    }
};

const updateAgency = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.updateAgency(parseInt(req.params.id), req.body.name, req.body.type);
        return successResponse(res, 'Instansi berhasil diperbarui.', data);
    } catch (error) {
        next(error);
    }
};

const deleteAgency = async (req, res, next) => {
    try {
        await service.deleteAgency(parseInt(req.params.id));
        return successResponse(res, 'Instansi berhasil dihapus.');
    } catch (error) {
        next(error);
    }
};

// ──────────────── Regions ────────────────

const getRegions = async (req, res, next) => {
    try {
        const { province, regency, district } = req.query;
        let data;
        if (district) {
            data = await service.getVillagesByDistrict(district);
        } else if (regency) {
            data = await service.getDistrictsByRegency(regency);
        } else if (province) {
            data = await service.getRegenciesByProvince(province);
        } else {
            data = await service.getAllRegions();
        }
        return successResponse(res, 'Data wilayah berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const createRegion = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const { province, regency, district, village } = req.body;
        const data = await service.createRegion(province, regency, district, village);
        return successResponse(res, 'Wilayah berhasil ditambahkan.', data, 201);
    } catch (error) {
        next(error);
    }
};

const updateRegion = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const { province, regency, district, village } = req.body;
        const data = await service.updateRegion(parseInt(req.params.id), province, regency, district, village);
        return successResponse(res, 'Wilayah berhasil diperbarui.', data);
    } catch (error) {
        next(error);
    }
};

const deleteRegion = async (req, res, next) => {
    try {
        await service.deleteRegion(parseInt(req.params.id));
        return successResponse(res, 'Wilayah berhasil dihapus.');
    } catch (error) {
        next(error);
    }
};

// ──────────────── Need Items ────────────────

const getNeedItems = async (req, res, next) => {
    try {
        const data = await service.getAllNeedItems();
        return successResponse(res, 'Daftar item kebutuhan berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const createNeedItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.createNeedItem(req.body.name, req.body.unit);
        return successResponse(res, 'Item kebutuhan berhasil ditambahkan.', data, 201);
    } catch (error) {
        next(error);
    }
};

const updateNeedItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 'Validasi gagal.', 422, errors.array());

        const data = await service.updateNeedItem(parseInt(req.params.id), req.body.name, req.body.unit);
        return successResponse(res, 'Item kebutuhan berhasil diperbarui.', data);
    } catch (error) {
        next(error);
    }
};

const deleteNeedItem = async (req, res, next) => {
    try {
        await service.deleteNeedItem(parseInt(req.params.id));
        return successResponse(res, 'Item kebutuhan berhasil dihapus.');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getDisasterTypes,
    createDisasterType,
    updateDisasterType,
    deleteDisasterType,
    getAgencies,
    createAgency,
    updateAgency,
    deleteAgency,
    getRegions,
    createRegion,
    updateRegion,
    deleteRegion,
    getNeedItems,
    createNeedItem,
    updateNeedItem,
    deleteNeedItem,
};
