const { pool } = require('../../config/database');

module.exports = {
    name: '011_add_update_type_to_rapid_assessments',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                ALTER TABLE rapid_assessments
                ADD COLUMN IF NOT EXISTS update_type VARCHAR(20) DEFAULT NULL,
                ADD COLUMN IF NOT EXISTS last_update_time TIMESTAMP WITH TIME ZONE DEFAULT NULL;
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
