const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Middleware to verify JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Akses ditolak. Token tidak ditemukan.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.jwt.secret);

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token telah kadaluarsa.', 401);
        }
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Token tidak valid.', 401);
        }
        return errorResponse(res, 'Autentikasi gagal.', 401);
    }
};

/**
 * Middleware to authorize specific roles
 * @param  {...string} roles - Allowed roles (ADMIN, PUSDALOPS, TRC, PIMPINAN)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Akses ditolak. Belum terautentikasi.', 401);
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 'Akses ditolak. Anda tidak memiliki izin.', 403);
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize,
};
