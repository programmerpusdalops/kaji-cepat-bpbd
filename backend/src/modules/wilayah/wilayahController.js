const service = require('./wilayahService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');

const getProvinces = async (req, res, next) => {
    try {
        const data = await service.getProvinces();
        return successResponse(res, 'Daftar provinsi berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getRegencies = async (req, res, next) => {
    try {
        const { province_id } = req.query;
        if (!province_id) return errorResponse(res, 'Parameter province_id wajib diisi.', 400);

        const data = await service.getRegencies(province_id);
        return successResponse(res, 'Daftar kabupaten berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getDistricts = async (req, res, next) => {
    try {
        const { regency_id } = req.query;
        if (!regency_id) return errorResponse(res, 'Parameter regency_id wajib diisi.', 400);

        const data = await service.getDistricts(regency_id);
        return successResponse(res, 'Daftar kecamatan berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const getVillages = async (req, res, next) => {
    try {
        const { district_id } = req.query;
        if (!district_id) return errorResponse(res, 'Parameter district_id wajib diisi.', 400);

        const data = await service.getVillages(district_id);
        return successResponse(res, 'Daftar desa berhasil diambil.', data);
    } catch (error) {
        next(error);
    }
};

const syncAll = async (req, res, next) => {
    try {
        const data = await service.syncAllDataSulteng();
        return successResponse(res, 'Sikronisasi massal seluruh wilayah Sulteng sedang berjalan.', data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProvinces,
    getRegencies,
    getDistricts,
    getVillages,
    syncAll
};
