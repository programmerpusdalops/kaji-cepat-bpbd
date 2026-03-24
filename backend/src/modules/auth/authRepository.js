const { query } = require('../../config/database');

/**
 * Auth Repository — database queries for authentication
 */

const findUserByEmail = async (email) => {
    const result = await query(
        'SELECT id, name, email, password, role, phone, instansi, created_at FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
};

const findUserById = async (id) => {
    const result = await query(
        'SELECT id, name, email, role, phone, instansi, created_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

const createUser = async ({ name, email, password, role, phone, instansi }) => {
    const result = await query(
        `INSERT INTO users (name, email, password, role, phone, instansi)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, phone, instansi, created_at`,
        [name, email, password, role || 'TRC', phone || null, instansi || null]
    );
    return result.rows[0];
};

const emailExists = async (email) => {
    const result = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
};

const findUserWithPassword = async (id) => {
    const result = await query(
        'SELECT id, name, email, password, role, phone, instansi, created_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

const updateProfile = async (id, { name, phone, instansi }) => {
    const result = await query(
        `UPDATE users SET name = $1, phone = $2, instansi = $3
     WHERE id = $4
     RETURNING id, name, email, role, phone, instansi, created_at`,
        [name, phone || null, instansi || null, id]
    );
    return result.rows[0] || null;
};

const updatePassword = async (id, hashedPassword) => {
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
    emailExists,
    findUserWithPassword,
    updateProfile,
    updatePassword,
};
