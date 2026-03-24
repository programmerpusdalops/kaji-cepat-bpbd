const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Migration runner
 * Tracks applied migrations in a migrations table
 */

const createMigrationsTable = async () => {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const getAppliedMigrations = async () => {
    const result = await pool.query('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
};

const recordMigration = async (name) => {
    await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
};

const runMigrations = async (migrations) => {
    try {
        await createMigrationsTable();
        const applied = await getAppliedMigrations();

        for (const migration of migrations) {
            if (applied.includes(migration.name)) {
                logger.info(`Migration already applied: ${migration.name}`);
                continue;
            }

            logger.info(`Applying migration: ${migration.name}`);
            await migration.up();
            await recordMigration(migration.name);
            logger.info(`Migration applied: ${migration.name}`);
        }

        logger.info('All migrations completed successfully.');
    } catch (error) {
        logger.error(`Migration failed: ${error.message}\n${error.stack}`);
        throw error;
    }
};

module.exports = { runMigrations };
