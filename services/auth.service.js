import bcrypt from 'bcryptjs';
import * as authRepository from '../repositories/user.repository.js';
import {generateToken} from './jwt.service.js'

export async function loginHandler(loginDTO) {
    const email = loginDTO.email;
    const password = loginDTO.password;
    const user = await authRepository.findByEmail(email);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const {accessToken, refreshToken} = generateToken(user);

    authRepository.updateRefreshToken(user.id, refreshToken)

    return {
        user: user,
        accessToken,
        refreshToken
    };
}