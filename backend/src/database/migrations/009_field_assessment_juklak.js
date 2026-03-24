const { pool } = require('../../config/database');

/**
 * Migration: 009_field_assessment_juklak
 * Extends field_assessments table with JSONB detail column for Juklak data
 */
module.exports = {
    name: '009_field_assessment_juklak',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Add detail JSONB column for Juklak structured data
            await client.query(`
                ALTER TABLE field_assessments
                ADD COLUMN IF NOT EXISTS detail JSONB DEFAULT '{}';
            `);

            // Add status column
            await client.query(`
                ALTER TABLE field_assessments
                ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT';
            `);

            // Add created_by column
            await client.query(`
                ALTER TABLE field_assessments
                ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
            `);

            // Add documentation photos (array of file paths)
            await client.query(`
                ALTER TABLE field_assessments
                ADD COLUMN IF NOT EXISTS doc_photos JSONB DEFAULT '[]';
            `);

            // Add infographic image path
            await client.query(`
                ALTER TABLE field_assessments
                ADD COLUMN IF NOT EXISTS infographic_path TEXT;
            `);

            // Add attachments (lampiran) — array of file paths
            await client.query(`
                ALTER TABLE field_assessments
                ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
            `);

            await client.query('CREATE INDEX IF NOT EXISTS idx_field_assessments_status ON field_assessments(status);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_field_assessments_created_by ON field_assessments(created_by);');

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};
