const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { testConnection } = require('./config/database');

const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            logger.warn('Server dimulai tanpa koneksi database. Pastikan PostgreSQL berjalan.');
        }

        // Start Express server
        const server = app.listen(env.port, () => {
            logger.info('='.repeat(50));
            logger.info(`BPBD Disaster Rapid Assessment API`);
            logger.info(`Environment : ${env.nodeEnv}`);
            logger.info(`Port        : ${env.port}`);
            logger.info(`API URL     : http://localhost:${env.port}/api/v1`);
            logger.info('='.repeat(50));
        });

        // Graceful shutdown
        const shutdown = (signal) => {
            logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(() => {
                logger.info('Server closed.');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout.');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
