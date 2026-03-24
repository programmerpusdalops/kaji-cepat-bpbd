const { pool } = require('../../config/database');

/**
 * Migration: 006_create_need_items_and_team_members
 * Creates need_items, emergency_need_details, and team_members tables
 */
module.exports = {
    name: '006_create_need_items_and_team_members',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ──────────────── Need Items (Master Data Kebutuhan) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS need_items (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(150) NOT NULL UNIQUE,
                    unit VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Emergency Need Details (relasi kebutuhan dinamis) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS emergency_need_details (
                    id SERIAL PRIMARY KEY,
                    emergency_need_id INTEGER NOT NULL REFERENCES emergency_needs(id) ON DELETE CASCADE,
                    need_item_id INTEGER NOT NULL REFERENCES need_items(id) ON DELETE RESTRICT,
                    quantity INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(emergency_need_id, need_item_id)
                );
            `);

            // ──────────────── Team Members ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS team_members (
                    id SERIAL PRIMARY KEY,
                    assignment_id INTEGER NOT NULL REFERENCES team_assignments(id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    division VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Indexes
            await client.query('CREATE INDEX IF NOT EXISTS idx_emergency_need_details_need ON emergency_need_details(emergency_need_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_team_members_assignment ON team_members(assignment_id);');

            // Auto-update triggers
            for (const table of ['need_items', 'emergency_need_details', 'team_members']) {
                await client.query(`
                    DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
                    CREATE TRIGGER update_${table}_updated_at
                        BEFORE UPDATE ON ${table}
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column();
                `);
            }

            // Seed default need items
            await client.query(`
                INSERT INTO need_items (name, unit) VALUES 
                    ('Makanan / Sembako', 'paket'),
                    ('Air Bersih', 'liter'),
                    ('Tenda Pengungsi', 'unit'),
                    ('Selimut & Pakaian', 'paket'),
                    ('Obat-obatan', 'paket'),
                    ('Alat Berat', 'unit'),
                    ('Masker', 'buah'),
                    ('Genset / Generator', 'unit'),
                    ('Peralatan Dapur', 'set'),
                    ('Kantong Jenazah', 'buah'),
                    ('Perahu Karet', 'unit'),
                    ('Tali & Karung', 'paket')
                ON CONFLICT (name) DO NOTHING;
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
