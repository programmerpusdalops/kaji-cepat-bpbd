const { query } = require('../../config/database');

/**
 * User Repository — database queries for user management
 */

const findAll = async () => {
    const result = await query(
        'SELECT id, name, email, role, phone, instansi, is_active, created_at FROM users WHERE is_active = true ORDER BY id'
    );
    return result.rows;
};

const findById = async (id) => {
    const result = await query(
        'SELECT id, name, email, role, phone, instansi, is_active, created_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

const create = async ({ name, email, password, role, phone, instansi }) => {
    const result = await query(
        `INSERT INTO users (name, email, password, role, phone, instansi)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, phone, instansi, is_active, created_at`,
        [name, email, password, role || 'TRC', phone || null, instansi || null]
    );
    return result.rows[0];
};

const update = async (id, { name, role, phone, instansi }) => {
    const result = await query(
        `UPDATE users SET name = $1, role = $2, phone = $3, instansi = $4
     WHERE id = $5
     RETURNING id, name, email, role, phone, instansi, is_active, created_at`,
        [name, role, phone || null, instansi || null, id]
    );
    return result.rows[0] || null;
};

const softDelete = async (id) => {
    const result = await query(
        `UPDATE users SET is_active = false
     WHERE id = $1
     RETURNING id, name, email, role, is_active`,
        [id]
    );
    return result.rows[0] || null;
};

const emailExists = async (email, excludeId = null) => {
    if (excludeId) {
        const result = await query('SELECT 1 FROM users WHERE email = $1 AND id != $2', [email, excludeId]);
        return result.rows.length > 0;
    }
    const result = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    softDelete,
    emailExists,
};
