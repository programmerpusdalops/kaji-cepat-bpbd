/**
 * CLI entry point: Run database seeders
 * Usage: node src/database/runSeed.js
 */
const { seedData } = require('./seed');
const logger = require('../utils/logger');

(async () => {
    try {
        await seedData();
        logger.info('Seed process completed.');
        process.exit(0);
    } catch (error) {
        logger.error('Seed process failed:', error.message);
        process.exit(1);
    }
})();
