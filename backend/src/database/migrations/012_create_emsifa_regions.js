const { pool } = require('../../config/database');

module.exports = {
    name: '012_create_emsifa_regions',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                CREATE TABLE IF NOT EXISTS provinces (
                    id VARCHAR(10) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS regencies (
                    id VARCHAR(10) PRIMARY KEY,
                    province_id VARCHAR(10) REFERENCES provinces(id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_regencies_province_id ON regencies(province_id);

                CREATE TABLE IF NOT EXISTS districts (
                    id VARCHAR(10) PRIMARY KEY,
                    regency_id VARCHAR(10) REFERENCES regencies(id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_districts_regency_id ON districts(regency_id);

                CREATE TABLE IF NOT EXISTS villages (
                    id VARCHAR(15) PRIMARY KEY,
                    district_id VARCHAR(10) REFERENCES districts(id) ON DELETE CASCADE,
                    name VARCHAR(200) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_villages_district_id ON villages(district_id);
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
