const { pool } = require('../../config/database');

/**
 * Migration: 003_create_master_data_tables
 * Creates agencies and regions tables for master data
 */
module.exports = {
    name: '003_create_master_data_tables',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ──────────────── Agencies ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS agencies (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL UNIQUE,
          type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Regions ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS regions (
          id SERIAL PRIMARY KEY,
          province VARCHAR(100) NOT NULL,
          regency VARCHAR(100),
          district VARCHAR(100),
          village VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            await client.query('CREATE INDEX IF NOT EXISTS idx_regions_province ON regions(province);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_regions_regency ON regions(regency);');

            // Auto-update triggers
            for (const table of ['agencies', 'regions']) {
                await client.query(`
          DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
          CREATE TRIGGER update_${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};
