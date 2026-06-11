import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepository from '../repositories/user.repository.js';
import {generateToken} from './jwt.service.js'
import { AppError } from '../errors/appError.js';


export async function loginHandler(loginDTO) {
    const email = loginDTO.email;
    const password = loginDTO.password;
    const user = await authRepository.findByEmail(email);

    if (!user) {
        throw new AppError('Invalid email or password', "INVALID_CREDENTIALS", 401);
    }

    if (user.status == "INACTIVE") {
        throw new AppError('Account is not active', "ACCOUNT_INACTIVE", 403);
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new AppError('Invalid email or password', "INVALID_CREDENTIALS", 401);
    }

    const {accessToken, refreshToken} = generateToken(user);

    authRepository.updateRefreshToken(user.id, refreshToken)

    return {
        user: user,
        accessToken,
        refreshToken
    };
}

export async function refreshHandler(refreshTokenCookie) {
    if (!refreshTokenCookie) {
        const err = new Error('Missing refresh token');
        err.statusCode = 401;
        throw err;
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH_TOKEN_SECRET);
    } catch (jwtError) {
        const err = new Error('Invalid or expired refresh token');
        err.statusCode = 401;
        throw err;
    }

    const user = await authRepository.findById(parseInt(decoded.sub));

    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 401;
        throw err;
    }

    if (user.status !== 'ACTIVE') {
        const err = new Error('Account is not active');
        err.statusCode = 403;
        throw err;
    }

    // Validate that the stored refresh token matches (token rotation security)
    if (user.refresh_token !== refreshTokenCookie) {
        const err = new Error('Refresh token has been revoked');
        err.statusCode = 401;
        throw err;
    }

    // Rotate: generate new pair
    const { accessToken, refreshToken } = generateToken(user);
    await authRepository.updateRefreshToken(user.id, refreshToken);

    return {
        user,
        accessToken,
        refreshToken
    };
}