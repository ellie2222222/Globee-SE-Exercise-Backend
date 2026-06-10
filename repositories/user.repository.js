import { prisma } from '../prisma.js';
export async function findByEmail(email) {
    return prisma.user.findUnique({
        where: {
            email
        }
    });
}

export async function findById(id) {
    return prisma.user.findUnique({
        where: {
            id
        }
    });
}

export async function updateRefreshToken(
    userId,
    refreshToken
) {
    return prisma.user.update({
        where: {
            id: userId
        },
        data: {
            refresh_token: refreshToken
        }
    });
}