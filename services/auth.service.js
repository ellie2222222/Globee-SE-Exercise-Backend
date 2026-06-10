import bcrypt from 'bcryptjs';
import * as authRepository from '../repositories/user.repository.js';
import {generateToken} from './jwt.service.js'
import { AppError } from '../errors/appError.js';


export async function loginHandler(loginDTO) {
    const email = loginDTO.email;
    const password = loginDTO.password;
    const user = await authRepository.findByEmail(email);

    if (!user) {
        throw new AppError('Invalid email or password', "VALIDATION_ERROR", 401);
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new AppError('Invalid email or password', "VALIDATION_ERROR", 401);
    }

    const {accessToken, refreshToken} = generateToken(user);

    authRepository.updateRefreshToken(user.id, refreshToken)

    return {
        user: user,
        accessToken,
        refreshToken
    };
}