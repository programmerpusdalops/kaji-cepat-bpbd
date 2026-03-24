const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Seed initial data: roles, disaster types, and admin user
 */
const seedData = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // ──────────────── Roles ────────────────
        const roles = ['ADMIN', 'PUSDALOPS', 'TRC', 'PIMPINAN'];
        for (const role of roles) {
            await client.query(
                'INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
                [role]
            );
        }
        logger.info('Seeded: roles');

        // ──────────────── Disaster Types ────────────────
        const disasterTypes = [
            'Banjir', 'Gempa Bumi', 'Tanah Longsor', 'Kebakaran',
            'Angin Puting Beliung', 'Tsunami', 'Kekeringan',
            'Banjir Bandang', 'Gunung Meletus', 'Gelombang Pasang',
            'Abrasi', 'Gempa Bumi dan Tsunami'
        ];
        for (const type of disasterTypes) {
            await client.query(
                'INSERT INTO disaster_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
                [type]
            );
        }
        logger.info('Seeded: disaster_types');

        // ──────────────── Admin User ────────────────
        const adminExists = await client.query('SELECT id FROM users WHERE email = $1', ['admin@bpbd.go.id']);
        if (adminExists.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.query(
                `INSERT INTO users (name, email, password, role, phone, instansi)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                ['Administrator', 'admin@bpbd.go.id', hashedPassword, 'ADMIN', '08123456789', 'BPBD Sulawesi Tengah']
            );
            logger.info('Seeded: admin user (admin@bpbd.go.id / admin123)');
        } else {
            logger.info('Admin user already exists, skipping.');
        }

        await client.query('COMMIT');
        logger.info('All seed data applied successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Seed failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { seedData };
