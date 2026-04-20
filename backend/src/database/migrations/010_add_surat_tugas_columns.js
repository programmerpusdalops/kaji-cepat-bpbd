const { pool } = require('../../config/database');

/**
 * Migration: 010_add_surat_tugas_columns
 * Adds Surat Tugas (ST) fields to team_assignments table
 * so ST data is stored together with the assignment.
 */
module.exports = {
    name: '010_add_surat_tugas_columns',

    up: async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                ALTER TABLE team_assignments
                    ADD COLUMN IF NOT EXISTS nomor_surat VARCHAR(100),
                    ADD COLUMN IF NOT EXISTS tanggal_surat VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS bulan_surat VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS tahun_surat VARCHAR(10),
                    ADD COLUMN IF NOT EXISTS desa VARCHAR(100),
                    ADD COLUMN IF NOT EXISTS nama_aparat_desa VARCHAR(100);
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
