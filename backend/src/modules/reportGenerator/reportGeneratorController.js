const reportGeneratorService = require('./reportGeneratorService');
const { successResponse, errorResponse } = require('../../utils/responseFormatter');
const path = require('path');
const fs = require('fs');

/**
 * Report Generator Controller
 */

const downloadDocx = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { path: filePath, filename } = await reportGeneratorService.generateDocx(Number(id));

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        
        // Clean up file after sending
        stream.on('end', () => {
            setTimeout(() => {
                try { fs.unlinkSync(filePath); } catch { /* ignore */ }
            }, 5000);
        });
    } catch (error) {
        next(error);
    }
};

const downloadPdf = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { path: filePath, filename } = await reportGeneratorService.generatePdf(Number(id));

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
        // If LibreOffice not available, return the DOCX path as fallback
        if (error.statusCode === 501 && error.docxPath) {
            return errorResponse(res, error.message, 501, { docx_url: error.docxPath });
        }
        next(error);
    }
};

module.exports = {
    downloadDocx,
    downloadPdf,
};
