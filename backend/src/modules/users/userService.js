const bcrypt = require('bcryptjs');
const userRepository = require('./userRepository');

/**
 * User Service — business logic for user management
 */

const getAllUsers = async () => {
    return await userRepository.findAll();
};

const getUserById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        const error = new Error('User tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

const createUser = async ({ name, email, password, role, phone, instansi }) => {
    const exists = await userRepository.emailExists(email);
    if (exists) {
        const error = new Error('Email sudah terdaftar.');
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await userRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        instansi,
    });
};

const updateUser = async (id, { name, role, phone, instansi }) => {
    // Check user exists
    const existing = await userRepository.findById(id);
    if (!existing) {
        const error = new Error('User tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.update(id, {
        name: name || existing.name,
        role: role || existing.role,
        phone: phone !== undefined ? phone : existing.phone,
        instansi: instansi !== undefined ? instansi : existing.instansi,
    });
};

const deleteUser = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        const error = new Error('User tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    if (!user.is_active) {
        const error = new Error('User sudah tidak aktif.');
        error.statusCode = 400;
        throw error;
    }

    return await userRepository.softDelete(id);
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
