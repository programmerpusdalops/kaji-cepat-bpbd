const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');
const logger = require('./utils/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const { successResponse } = require('./utils/responseFormatter');

const app = express();

// --------------- Security Middlewares ---------------
app.use(helmet());

app.use(cors({
    origin: env.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    message: {
        success: false,
        message: 'Terlalu banyak request. Silahkan coba lagi nanti.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// --------------- Body Parsers ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --------------- Static Files ---------------
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --------------- HTTP Request Logging ---------------
const morganStream = {
    write: (message) => logger.info(message.trim()),
};
app.use(morgan('combined', { stream: morganStream }));

// --------------- Health Check ---------------
app.get('/api/v1/health', (req, res) => {
    return successResponse(res, 'Server berjalan dengan baik', {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
    });
});

// --------------- API Routes ---------------
app.use('/api/v1/auth', require('./modules/auth/authRoutes'));
app.use('/api/v1/users', require('./modules/users/userRoutes'));
app.use('/api/v1/master-data', require('./modules/masterData/masterDataRoutes'));
app.use('/api/v1/disaster-reports', require('./modules/disasters/disasterRoutes'));
app.use('/api/v1/team-assignments', require('./modules/teamAssignments/teamAssignmentRoutes'));
app.use('/api/v1/field-assessments', require('./modules/fieldAssessments/fieldAssessmentRoutes'));
app.use('/api/v1/emergency-needs', require('./modules/emergencyNeeds/emergencyNeedsRoutes'));
app.use('/api/v1/map-objects', require('./modules/mapObjects/mapObjectRoutes'));
app.use('/api/v1/rapid-assessments', require('./modules/rapidAssessment/rapidAssessmentRoutes'));
app.use('/api/v1/reports', require('./modules/reportGenerator/reportGeneratorRoutes'));
app.use('/api/v1/surat-tugas', require('./modules/suratTugas/suratTugasRoutes'));
app.use('/api/v1/dashboard', require('./modules/dashboard/dashboardRoutes'));
app.use('/api/v1/wilayah', require('./modules/wilayah/wilayahRoutes'));

// --------------- Error Handling ---------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
