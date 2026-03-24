const repo = require('./disasterRepository');

/**
 * Disaster Reports Service
 */

const getAllReports = async (filters) => {
    return await repo.findAll(filters);
};

const getReportById = async (id) => {
    const report = await repo.findById(id);
    if (!report) {
        const error = new Error('Laporan bencana tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const verificationLogs = await repo.findVerificationLogsByReportId(id);
    return { ...report, verification_logs: verificationLogs };
};

const createReport = async (data) => {
    const reportCode = await repo.generateReportCode();
    return await repo.create({ ...data, report_code: reportCode });
};

const verifyReport = async (reportId, userId, { status, verification_note }) => {
    const report = await repo.findById(reportId);
    if (!report) {
        const error = new Error('Laporan bencana tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    // Update report status
    await repo.updateStatus(reportId, status);

    // Create verification log
    const log = await repo.createVerificationLog({
        report_id: reportId,
        verified_by: userId,
        status,
        notes: verification_note,
    });

    return log;
};

module.exports = {
    getAllReports,
    getReportById,
    createReport,
    verifyReport,
};
