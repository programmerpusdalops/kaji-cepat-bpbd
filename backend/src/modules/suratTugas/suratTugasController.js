const service = require('./suratTugasService');
const fs = require('fs');

/**
 * Surat Tugas Controller
 * GET-based endpoints — no body input needed, data comes from DB.
 */

/**
 * GET /api/v1/surat-tugas/generate/:assignmentId
 */
const generateDocx = async (req, res, next) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        const { path: filePath, filename } = await service.generateDocx(assignmentId);

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        stream.on('end', () => {
            setTimeout(() => {
                try { fs.unlinkSync(filePath); } catch { /* ignore */ }
            }, 5000);
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/surat-tugas/generate/:assignmentId/pdf
 */
const generatePdf = async (req, res, next) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        const { path: filePath, filename } = await service.generatePdf(assignmentId);

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/pdf');

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        stream.on('end', () => {
            setTimeout(() => {
                try { fs.unlinkSync(filePath); } catch { /* ignore */ }
            }, 5000);
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateDocx,
    generatePdf,
};
