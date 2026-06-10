import { LoginDTO } from '../dtos/login.dto.js';
import * as authService from '../services/auth.service.js'
import * as authRepository from '../repositories/user.repository.js'

export async function login(req, res, next) {
    try {
        const dto = new LoginDTO(req.body);
        const { user, accessToken, refreshToken } = await authService.loginHandler(dto);

        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            "id": user.id.toString(),
            "email": user.email,
            "name": user.name,
            "status": user.status
        });
    } catch (error) {
        next(error);
    }
}

export async function logout(req, res, next) {
    try {
        await authRepository.updateRefreshToken(req.user.id, null);

        const isProd = process.env.NODE_ENV === 'production';

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
}

export async function me(req, res) {
    const user = req.user;
    res.json({
        "id": user.id.toString(),
        "email": user.email,
        "name": user.name,
        "status": user.status
    });
}