const { pool } = require('../../config/database');

/**
 * Migration: 007_create_rapid_assessment_tables
 * Creates all tables for the Kaji Cepat (Rapid Assessment) module
 */
module.exports = {
    name: '007_create_rapid_assessment_tables',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ──────────────── Rapid Assessments (main table) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS rapid_assessments (
                    id SERIAL PRIMARY KEY,
                    report_id INTEGER REFERENCES disaster_reports(id) ON DELETE SET NULL,
                    disaster_type_id INTEGER NOT NULL REFERENCES disaster_types(id) ON DELETE RESTRICT,
                    province VARCHAR(100) NOT NULL DEFAULT 'Sulawesi Tengah',
                    regency VARCHAR(100) NOT NULL,
                    district VARCHAR(100) NOT NULL,
                    waktu_kejadian TIMESTAMP NOT NULL,
                    waktu_laporan TIMESTAMP NOT NULL,
                    kronologis TEXT,
                    peta_link TEXT,
                    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
                    wa_message_cache TEXT,
                    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Villages ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_villages (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    village_name VARCHAR(100) NOT NULL,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Affected (Terdampak per desa) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_affected (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    village_id INTEGER REFERENCES assessment_villages(id) ON DELETE CASCADE,
                    jumlah_kk INTEGER NOT NULL DEFAULT 0,
                    jumlah_jiwa INTEGER NOT NULL DEFAULT 0,
                    keterangan TEXT,
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Refugees (Pengungsi per desa) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_refugees (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    village_id INTEGER REFERENCES assessment_villages(id) ON DELETE CASCADE,
                    jumlah_kk INTEGER NOT NULL DEFAULT 0,
                    jumlah_jiwa INTEGER NOT NULL DEFAULT 0,
                    keterangan TEXT,
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Casualties (Korban Jiwa per desa) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_casualties (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    village_id INTEGER REFERENCES assessment_villages(id) ON DELETE CASCADE,
                    jumlah_kk INTEGER NOT NULL DEFAULT 0,
                    jumlah_jiwa INTEGER NOT NULL DEFAULT 0,
                    keterangan TEXT,
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Steps (Langkah yang dilaksanakan) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_steps (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    langkah TEXT NOT NULL,
                    is_master BOOLEAN NOT NULL DEFAULT false,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Needs (Kebutuhan mendesak) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_needs (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    need_item_id INTEGER REFERENCES need_items(id) ON DELETE SET NULL,
                    custom_name VARCHAR(200),
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Situations (Situasi akhir) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_situations (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    situasi TEXT NOT NULL,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Sources (Sumber) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_sources (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    sumber TEXT NOT NULL,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Assessment Recipients (Penerima WA) ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_recipients (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    nomor INTEGER NOT NULL,
                    nama VARCHAR(200) NOT NULL,
                    is_default BOOLEAN NOT NULL DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── WA Send Logs ────────────────
            await client.query(`
                CREATE TABLE IF NOT EXISTS wa_send_logs (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    phone_number VARCHAR(20) NOT NULL,
                    message_preview TEXT,
                    fonnte_response TEXT,
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    sent_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // ──────────────── Indexes ────────────────
            await client.query('CREATE INDEX IF NOT EXISTS idx_rapid_assessments_report ON rapid_assessments(report_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_rapid_assessments_status ON rapid_assessments(status);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_rapid_assessments_created_by ON rapid_assessments(created_by);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_assessment_villages_assessment ON assessment_villages(assessment_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_assessment_affected_assessment ON assessment_affected(assessment_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_assessment_refugees_assessment ON assessment_refugees(assessment_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_assessment_casualties_assessment ON assessment_casualties(assessment_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_wa_send_logs_assessment ON wa_send_logs(assessment_id);');

            // ──────────────── Auto-update triggers ────────────────
            const tablesWithUpdatedAt = [
                'rapid_assessments', 'assessment_villages', 'assessment_affected',
                'assessment_refugees', 'assessment_casualties', 'assessment_steps',
                'assessment_needs', 'assessment_situations', 'assessment_sources',
                'assessment_recipients'
            ];

            for (const table of tablesWithUpdatedAt) {
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
