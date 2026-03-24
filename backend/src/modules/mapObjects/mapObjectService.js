const mapObjectRepository = require('./mapObjectRepository');

/**
 * Map Object Service — business logic for collaborative map
 */

/**
 * Parse photo_path from DB (can be JSON array string or single path or null)
 */
const parsePhotos = (photoPath) => {
    if (!photoPath) return [];
    try {
        const parsed = JSON.parse(photoPath);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
    } catch {
        // Old single-path format
        return photoPath ? [photoPath] : [];
    }
};

/**
 * Convert database rows to GeoJSON FeatureCollection
 */
const toGeoJSON = (rows, disasterInfo = null) => {
    const features = rows.map(row => ({
        type: 'Feature',
        id: row.id,
        geometry: typeof row.geometry === 'string' ? JSON.parse(row.geometry) : row.geometry,
        properties: {
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            type: row.type,
            photos: parsePhotos(row.photo_path),
            status: row.status,
            creator_name: row.creator_name,
            created_at: row.created_at,
            updated_at: row.updated_at,
        },
    }));

    return {
        type: 'FeatureCollection',
        disaster: disasterInfo || undefined,
        features,
    };
};

/**
 * Generate URL-friendly slug from disaster info
 */
const generateSlug = (disasterInfo) => {
    if (!disasterInfo) return '';
    const text = `${disasterInfo.disaster_type || ''} ${disasterInfo.description || disasterInfo.report_code || ''}`;
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60)
        .replace(/-$/, '');
};

const getByDisasterId = async (disasterId) => {
    const rows = await mapObjectRepository.findByDisasterId(disasterId);
    const disasterInfo = await mapObjectRepository.findDisasterInfo(disasterId);
    if (!disasterInfo) {
        const error = new Error('Laporan bencana tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    disasterInfo.slug = generateSlug(disasterInfo);
    return toGeoJSON(rows, disasterInfo);
};

const getByAssessmentId = async (assessmentId) => {
    const rows = await mapObjectRepository.findByAssessmentId(assessmentId);
    const assessmentInfo = await mapObjectRepository.findAssessmentInfo(assessmentId);
    if (!assessmentInfo) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    assessmentInfo.slug = generateSlug(assessmentInfo);
    return toGeoJSON(rows, assessmentInfo);
};

const getById = async (id) => {
    const obj = await mapObjectRepository.findById(id);
    if (!obj) {
        const error = new Error('Map object tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return obj;
};

const createObject = async (data) => {
    return await mapObjectRepository.create(data);
};

const updateObject = async (id, data) => {
    const existing = await mapObjectRepository.findById(id);
    if (!existing) {
        const error = new Error('Map object tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return await mapObjectRepository.update(id, {
        title: data.title || existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        category: data.category !== undefined ? data.category : existing.category,
        geometry: data.geometry || existing.geometry,
        photo_path: data.photo_path || null,
        status: data.status || existing.status,
    });
};

const deleteObject = async (id) => {
    const existing = await mapObjectRepository.findById(id);
    if (!existing) {
        const error = new Error('Map object tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return await mapObjectRepository.remove(id);
};

module.exports = {
    getByDisasterId,
    getByAssessmentId,
    getById,
    createObject,
    updateObject,
    deleteObject,
    generateSlug,
    parsePhotos,
};
