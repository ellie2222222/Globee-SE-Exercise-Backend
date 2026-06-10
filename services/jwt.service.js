import jwt from 'jsonwebtoken';

export function generateToken(user) {
    const accessToken = jwt.sign(
        {
            sub: user.id.toString(),
            email: user.email
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
    const refreshToken = jwt.sign(
        {
            sub: user.id.toString()
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );

    return {
        accessToken,
        refreshToken
    };
}