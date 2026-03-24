const repo = require('./rapidAssessmentRepository');
const { generateWhatsAppMessage } = require('./waMessageGenerator');
const fonnteService = require('./fonnteService');
const logger = require('../../utils/logger');

/**
 * Rapid Assessment Service — business logic for Kaji Cepat
 */

const getAllAssessments = async (filters) => {
    return await repo.findAll(filters);
};

const getDropdownList = async () => {
    return await repo.findAllForDropdown();
};

const getAssessmentById = async (id) => {
    const assessment = await repo.findById(id);
    if (!assessment) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return assessment;
};

const createAssessment = async (data, userId) => {
    // Create assessment
    const assessment = await repo.create({
        ...data,
        created_by: userId,
    });

    // Fetch full data to generate WA message
    const fullData = await repo.findById(assessment.id);
    const waMessage = generateWhatsAppMessage(fullData);

    // Cache the WA message
    await repo.updateWaCache(assessment.id, waMessage);

    return {
        ...fullData,
        wa_message_cache: waMessage,
    };
};

const updateAssessment = async (id, data) => {
    const existing = await repo.findById(id);
    if (!existing) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const updated = await repo.update(id, data);

    // Regenerate WA message
    const waMessage = generateWhatsAppMessage(updated);
    await repo.updateWaCache(id, waMessage);

    return {
        ...updated,
        wa_message_cache: waMessage,
    };
};

const deleteAssessment = async (id) => {
    const existing = await repo.findById(id);
    if (!existing) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    await repo.deleteById(id);
    return { id };
};

const generateMessage = async (id) => {
    const assessment = await repo.findById(id);
    if (!assessment) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const message = generateWhatsAppMessage(assessment);
    await repo.updateWaCache(id, message);

    return { message };
};

const sendWhatsApp = async (id, phoneNumbers) => {
    const assessment = await repo.findById(id);
    if (!assessment) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    // Generate message (or use cache)
    const message = assessment.wa_message_cache || generateWhatsAppMessage(assessment);

    if (!assessment.wa_message_cache) {
        await repo.updateWaCache(id, message);
    }

    // Send to all phone numbers
    const results = await fonnteService.sendBulk(phoneNumbers, message);

    // Log all send attempts
    const logs = [];
    for (const result of results) {
        const log = await repo.createWaSendLog({
            assessment_id: id,
            phone_number: result.target,
            message_preview: message.substring(0, 500),
            fonnte_response: JSON.stringify(result.response),
            status: result.success ? 'SENT' : 'FAILED',
            sent_at: result.success ? new Date() : null,
        });
        logs.push(log);
    }

    // Update assessment status to SENT if at least one was successful
    const anySuccess = results.some(r => r.success);
    if (anySuccess) {
        await repo.updateStatus(id, 'SENT');
    }

    return {
        message,
        results,
        logs,
    };
};

const resendWhatsApp = async (id) => {
    // Get failed logs
    const logs = await repo.findWaSendLogs(id);
    const failedPhones = logs
        .filter(l => l.status === 'FAILED')
        .map(l => l.phone_number);

    if (failedPhones.length === 0) {
        return { message: 'Tidak ada pesan gagal untuk dikirim ulang.', results: [] };
    }

    return await sendWhatsApp(id, failedPhones);
};

const getWaSendLogs = async (id) => {
    const assessment = await repo.findById(id);
    if (!assessment) {
        const error = new Error('Data kaji cepat tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    return await repo.findWaSendLogs(id);
};

module.exports = {
    getAllAssessments,
    getDropdownList,
    getAssessmentById,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    generateMessage,
    sendWhatsApp,
    resendWhatsApp,
    getWaSendLogs,
};
