const { pool } = require('../../config/database');

module.exports = {
    name: '013_add_photos_to_rapid_assessments',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                CREATE TABLE IF NOT EXISTS assessment_photos (
                    id SERIAL PRIMARY KEY,
                    assessment_id INTEGER NOT NULL REFERENCES rapid_assessments(id) ON DELETE CASCADE,
                    photo_url TEXT NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await client.query('CREATE INDEX IF NOT EXISTS idx_assessment_photos_assessment ON assessment_photos(assessment_id);');

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};
