const express = require('express');
const router = express.Router();
const ctrl = require('./suratTugasController');
const { authenticate } = require('../../middlewares/authMiddleware');

/**
 * Surat Tugas Routes
 *
 * GET /api/v1/surat-tugas/generate/:assignmentId      - Download DOCX
 * GET /api/v1/surat-tugas/generate/:assignmentId/pdf   - Download PDF
 */

router.use(authenticate);

router.get('/generate/:assignmentId', ctrl.generateDocx);
router.get('/generate/:assignmentId/pdf', ctrl.generatePdf);

module.exports = router;
