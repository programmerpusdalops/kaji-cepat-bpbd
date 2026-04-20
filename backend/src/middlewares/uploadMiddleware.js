const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * File upload middleware for map photos
 * - Max size: 5MB per file
 * - Allowed: jpg, jpeg, png
 * - Dest: uploads/map-photos/
 * - Supports multiple files (up to 5)
 */

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'map-photos');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `map-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file JPG, JPEG, dan PNG yang diizinkan.'), false);
    }
};

const uploadMapPhoto = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

const assessmentUploadDir = path.join(__dirname, '..', '..', 'uploads', 'assessments');
if (!fs.existsSync(assessmentUploadDir)) {
    fs.mkdirSync(assessmentUploadDir, { recursive: true });
}

const assessmentStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, assessmentUploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `assessment-${uniqueSuffix}${ext}`);
    },
});

const uploadAssessmentPhoto = multer({
    storage: assessmentStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadMapPhoto, uploadAssessmentPhoto };
