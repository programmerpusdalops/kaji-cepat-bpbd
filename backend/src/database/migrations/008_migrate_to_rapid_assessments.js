const { pool } = require('../../config/database');

/**
 * Migration: 008_migrate_to_rapid_assessments
 * 
 * Adds assessment_id FK to team_assignments, field_assessments, map_objects
 * so they can reference rapid_assessments instead of disaster_reports.
 * Makes report_id/disaster_id nullable for backward compatibility.
 */
module.exports = {
    name: '008_migrate_to_rapid_assessments',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ── team_assignments: add assessment_id, make report_id nullable ──
            await client.query(`
                ALTER TABLE team_assignments 
                ADD COLUMN IF NOT EXISTS assessment_id INTEGER REFERENCES rapid_assessments(id) ON DELETE CASCADE;
            `);
            await client.query(`
                ALTER TABLE team_assignments 
                ALTER COLUMN report_id DROP NOT NULL;
            `);

            // ── field_assessments: add assessment_id, make report_id nullable ──
            await client.query(`
                ALTER TABLE field_assessments 
                ADD COLUMN IF NOT EXISTS assessment_id INTEGER REFERENCES rapid_assessments(id) ON DELETE CASCADE;
            `);
            await client.query(`
                ALTER TABLE field_assessments 
                ALTER COLUMN report_id DROP NOT NULL;
            `);

            // ── map_objects: make disaster_id nullable, add assessment_id ──
            await client.query(`
                ALTER TABLE map_objects 
                ALTER COLUMN disaster_id DROP NOT NULL;
            `);
            await client.query(`
                ALTER TABLE map_objects 
                ADD COLUMN IF NOT EXISTS assessment_id INTEGER REFERENCES rapid_assessments(id) ON DELETE CASCADE;
            `);

            // ── Indexes ──
            await client.query('CREATE INDEX IF NOT EXISTS idx_team_assignments_assessment ON team_assignments(assessment_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_field_assessments_assessment ON field_assessments(assessment_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_map_objects_assessment ON map_objects(assessment_id);');

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};
