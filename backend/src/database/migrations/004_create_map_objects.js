const { pool } = require('../../config/database');

/**
 * Migration: 004_create_map_objects
 * Creates map_objects table for collaborative disaster mapping
 */
module.exports = {
    name: '004_create_map_objects',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ──────────────── Map Objects ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS map_objects (
                    id SERIAL PRIMARY KEY,
                    disaster_id INTEGER NOT NULL REFERENCES disaster_reports(id) ON DELETE CASCADE,
                    type VARCHAR(20) NOT NULL CHECK (type IN ('marker', 'polygon', 'polyline')),
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    category VARCHAR(50),
                    geometry JSONB NOT NULL,
                    photo_path VARCHAR(255),
                    status VARCHAR(30) DEFAULT 'aktif',
                    created_by INTEGER REFERENCES users(id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Indexes ────────────────
            await client.query('CREATE INDEX IF NOT EXISTS idx_map_objects_disaster ON map_objects(disaster_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_map_objects_category ON map_objects(category);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_map_objects_type ON map_objects(type);');

            // ──────────────── Auto-update trigger ────────────────
            await client.query(`
                DROP TRIGGER IF EXISTS update_map_objects_updated_at ON map_objects;
                CREATE TRIGGER update_map_objects_updated_at
                    BEFORE UPDATE ON map_objects
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};
