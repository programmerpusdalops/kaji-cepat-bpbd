const { pool } = require('../../config/database');

/**
 * Migration: 002_add_is_active_to_users
 * Adds is_active column for soft delete support
 */
module.exports = {
    name: '002_add_is_active_to_users',

    up: async () => {
        await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    `);
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);');
    },
};
