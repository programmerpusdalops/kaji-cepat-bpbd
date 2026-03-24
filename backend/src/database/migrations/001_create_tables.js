const { pool } = require('../../config/database');

/**
 * Migration: 001_create_tables
 * Creates all base tables with PostGIS support
 */
module.exports = {
    name: '001_create_tables',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ──────────────── Enable PostGIS ────────────────
            await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');

            // ──────────────── Roles ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Users ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'TRC',
          phone VARCHAR(20),
          instansi VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Disaster Types ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS disaster_types (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Disaster Reports ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS disaster_reports (
          id SERIAL PRIMARY KEY,
          report_code VARCHAR(50) NOT NULL UNIQUE,
          disaster_type_id INTEGER NOT NULL REFERENCES disaster_types(id) ON DELETE RESTRICT,
          reporter_name VARCHAR(100) NOT NULL,
          report_source VARCHAR(50),
          description TEXT,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          location GEOMETRY(Point, 4326),
          status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
          report_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Verification Logs ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS verification_logs (
          id SERIAL PRIMARY KEY,
          report_id INTEGER NOT NULL REFERENCES disaster_reports(id) ON DELETE CASCADE,
          verified_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          status VARCHAR(30) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Team Assignments ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS team_assignments (
          id SERIAL PRIMARY KEY,
          report_id INTEGER NOT NULL REFERENCES disaster_reports(id) ON DELETE CASCADE,
          team_name VARCHAR(100) NOT NULL,
          leader VARCHAR(100) NOT NULL,
          total_members INTEGER NOT NULL DEFAULT 1,
          vehicle VARCHAR(100),
          departure_time TIMESTAMP,
          arrival_estimate TIMESTAMP,
          status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Field Assessments ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS field_assessments (
          id SERIAL PRIMARY KEY,
          report_id INTEGER NOT NULL REFERENCES disaster_reports(id) ON DELETE CASCADE,
          province VARCHAR(100),
          regency VARCHAR(100),
          district VARCHAR(100),
          village VARCHAR(100),
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          location GEOMETRY(Point, 4326),
          assessment_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Victims ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS victims (
          id SERIAL PRIMARY KEY,
          assessment_id INTEGER NOT NULL REFERENCES field_assessments(id) ON DELETE CASCADE,
          dead INTEGER NOT NULL DEFAULT 0,
          missing INTEGER NOT NULL DEFAULT 0,
          severe_injured INTEGER NOT NULL DEFAULT 0,
          minor_injured INTEGER NOT NULL DEFAULT 0,
          evacuated INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── House Damage ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS house_damage (
          id SERIAL PRIMARY KEY,
          assessment_id INTEGER NOT NULL REFERENCES field_assessments(id) ON DELETE CASCADE,
          heavy INTEGER NOT NULL DEFAULT 0,
          moderate INTEGER NOT NULL DEFAULT 0,
          light INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Facility Damage ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS facility_damage (
          id SERIAL PRIMARY KEY,
          assessment_id INTEGER NOT NULL REFERENCES field_assessments(id) ON DELETE CASCADE,
          school INTEGER NOT NULL DEFAULT 0,
          hospital INTEGER NOT NULL DEFAULT 0,
          worship_place INTEGER NOT NULL DEFAULT 0,
          government_building INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Infrastructure Damage ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS infrastructure_damage (
          id SERIAL PRIMARY KEY,
          assessment_id INTEGER NOT NULL REFERENCES field_assessments(id) ON DELETE CASCADE,
          road INTEGER NOT NULL DEFAULT 0,
          bridge INTEGER NOT NULL DEFAULT 0,
          electricity INTEGER NOT NULL DEFAULT 0,
          water INTEGER NOT NULL DEFAULT 0,
          telecommunication INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Emergency Needs ────────────────
            await client.query(`
        CREATE TABLE IF NOT EXISTS emergency_needs (
          id SERIAL PRIMARY KEY,
          assessment_id INTEGER NOT NULL REFERENCES field_assessments(id) ON DELETE CASCADE,
          food INTEGER NOT NULL DEFAULT 0,
          water INTEGER NOT NULL DEFAULT 0,
          tents INTEGER NOT NULL DEFAULT 0,
          blankets INTEGER NOT NULL DEFAULT 0,
          medicine INTEGER NOT NULL DEFAULT 0,
          heavy_equipment INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // ──────────────── Indexes ────────────────
            await client.query('CREATE INDEX IF NOT EXISTS idx_disaster_reports_status ON disaster_reports(status);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_disaster_reports_type ON disaster_reports(disaster_type_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_disaster_reports_location ON disaster_reports USING GIST(location);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_field_assessments_report ON field_assessments(report_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_field_assessments_location ON field_assessments USING GIST(location);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_verification_logs_report ON verification_logs(report_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_team_assignments_report ON team_assignments(report_id);');
            await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');

            // ──────────────── Auto-update trigger for updated_at ────────────────
            await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

            const tablesWithUpdatedAt = [
                'roles', 'users', 'disaster_types', 'disaster_reports',
                'verification_logs', 'team_assignments', 'field_assessments',
                'victims', 'house_damage', 'facility_damage',
                'infrastructure_damage', 'emergency_needs'
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
