import { LoginDTO } from '../dtos/login.dto.js';
import * as authService from '../services/auth.service.js'

export async function login(req, res, next) {
    try {
        const dto = new LoginDTO(req.body);
        const {user, accessToken, refreshToken} = await authService.loginHandler(dto);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: 'production',
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: 'production',
            sameSite: 'none',
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