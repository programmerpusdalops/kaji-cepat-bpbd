/**
 * Standardized API response formatter
 *
 * All API responses use this format:
 * { success: boolean, message: string, data?: any }
 */

/**
 * Send a success response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any} data
 * @param {number} statusCode
 */
const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
    const response = {
        success: true,
        message,
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {any} errors
 */
const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
    };
    if (errors !== null) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any} data
 * @param {object} pagination
 */
const paginatedResponse = (res, message = 'Success', data = [], pagination = {}) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination,
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse,
};
