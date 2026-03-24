const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const authRepository = require('./authRepository');

/**
 * Auth Service — business logic for authentication
 */

const login = async (email, password) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
        const error = new Error('Email atau password salah.');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Email atau password salah.');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        env.jwt.secret,
        { expiresIn: env.jwt.expire }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
};

const register = async ({ name, email, password, role, phone, instansi }) => {
    // Check duplicate email
    const exists = await authRepository.emailExists(email);
    if (exists) {
        const error = new Error('Email sudah terdaftar.');
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authRepository.createUser({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        instansi,
    });

    const token = jwt.sign(
        { id: user.id, role: user.role },
        env.jwt.secret,
        { expiresIn: env.jwt.expire }
    );

    return { token, user };
};

const getProfile = async (userId) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
        const error = new Error('User tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

const updateProfile = async (userId, { name, phone, instansi }) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
        const error = new Error('User tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    return await authRepository.updateProfile(userId, {
        name: name || user.name,
        phone: phone !== undefined ? phone : user.phone,
        instansi: instansi !== undefined ? instansi : user.instansi,
    });
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await authRepository.findUserWithPassword(userId);
    if (!user) {
        const error = new Error('User tidak ditemukan.');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error('Password lama tidak sesuai.');
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(userId, hashedPassword);
};

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
};
