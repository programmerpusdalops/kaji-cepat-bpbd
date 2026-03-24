const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        name: process.env.DB_NAME || 'bpbd_disaster',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'supersecret',
        expire: process.env.JWT_EXPIRE || '1d',
    },

    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 5 * 1024 * 1024,
        dir: process.env.UPLOAD_DIR || 'uploads',
    },

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },

    fonnte: {
        apiKey: process.env.FONNTE_API_KEY || '',
        targetNumbers: process.env.FONNTE_TARGET_NUMBERS ? process.env.FONNTE_TARGET_NUMBERS.split(',') : [],
    },
};

module.exports = env;
