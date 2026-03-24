const express = require('express');
const router = express.Router();
const ctrl = require('./reportGeneratorController');
const { authenticate } = require('../../middlewares/authMiddleware');

/**
 * Report Generator Routes
 *
 * GET /api/v1/reports/generate/docx/:id  — Download DOCX for a field assessment
 * GET /api/v1/reports/generate/pdf/:id   — Download PDF for a field assessment
 */

router.use(authenticate);

router.get('/generate/docx/:id', ctrl.downloadDocx);
router.get('/generate/pdf/:id', ctrl.downloadPdf);

module.exports = router;
