/**
 * Fonnte WhatsApp API Integration Service
 * Sends WhatsApp messages via api.fonnte.com
 */
const env = require('../../config/env');
const logger = require('../../utils/logger');

const FONNTE_API_URL = 'https://api.fonnte.com/send';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send a single WhatsApp message via Fonnte
 * @param {string} target - Phone number (e.g. "628123456789")
 * @param {string} message - Message content
 * @returns {Object} { success, response, error }
 */
const sendMessage = async (target, message) => {
    const apiKey = env.fonnte?.apiKey;
    if (!apiKey) {
        logger.warn('Fonnte API key not configured. Message not sent.');
        return {
            success: false,
            response: null,
            error: 'FONNTE_API_KEY not configured',
        };
    }

    try {
        const res = await fetch(FONNTE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target,
                message,
                countryCode: '62',
            }),
        });

        const responseData = await res.json();
        logger.info(`Fonnte response for ${target}: ${JSON.stringify(responseData)}`);

        return {
            success: responseData.status === true || responseData.detail === 'sent' || res.ok,
            response: responseData,
            error: null,
        };
    } catch (error) {
        logger.error(`Fonnte send error for ${target}: ${error.message}`);
        return {
            success: false,
            response: null,
            error: error.message,
        };
    }
};

/**
 * Send message with retry logic
 */
const sendMessageWithRetry = async (target, message, retries = MAX_RETRIES) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const result = await sendMessage(target, message);
        if (result.success) return result;

        if (attempt < retries) {
            logger.warn(`Fonnte retry ${attempt}/${retries} for ${target}`);
            await sleep(RETRY_DELAY_MS * attempt);
        }
    }

    // Final attempt failed
    return {
        success: false,
        response: null,
        error: `Failed after ${retries} retries`,
    };
};

/**
 * Send message to multiple recipients
 * @param {string[]} targets - Array of phone numbers
 * @param {string} message - Message content
 * @returns {Object[]} Results array with { target, success, response, error }
 */
const sendBulk = async (targets, message) => {
    const results = [];

    for (const target of targets) {
        const result = await sendMessageWithRetry(target, message);
        results.push({
            target,
            ...result,
        });

        // Small delay between sends to avoid rate limiting
        await sleep(500);
    }

    return results;
};

module.exports = {
    sendMessage,
    sendMessageWithRetry,
    sendBulk,
};
