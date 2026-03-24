const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    return errorResponse(res, `Route ${req.method} ${req.originalUrl} tidak ditemukan.`, 404);
};

/**
 * Centralized error handler
 * All errors thrown in routes, controllers, and services are caught here.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    logger.error(`${err.message}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        stack: err.stack,
    });

    // Validation errors from express-validator
    if (err.type === 'validation') {
        return errorResponse(res, 'Validasi gagal.', 422, err.errors);
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return errorResponse(res, 'Ukuran file melebihi batas (maks 5MB).', 413);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return errorResponse(res, 'Field upload tidak sesuai.', 400);
    }

    // PostgreSQL errors
    if (err.code === '23505') {
        return errorResponse(res, 'Data sudah ada (duplikat).', 409);
    }
    if (err.code === '23503') {
        return errorResponse(res, 'Referensi data tidak valid.', 400);
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500
        ? 'Terjadi kesalahan pada server.'
        : err.message;

    return errorResponse(res, message, statusCode);
};

module.exports = {
    notFoundHandler,
    errorHandler,
};
