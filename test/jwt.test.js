import { generateToken } from '../services/jwt.service.js'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken')

describe('generateToken', () => {
    const mockUser = {
        id: 1n,
        email: 'test@gmail.com',
        password: 'test',
        name: 'Test User',
        refresh_token: null,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should generate access and refresh token', () => {
        jwt.sign
            .mockReturnValueOnce('access_token')
            .mockReturnValueOnce('refresh_token')

        const result = generateToken(mockUser)

        expect(jwt.sign).toHaveBeenCalledTimes(2)

        expect(result).toEqual({
            accessToken: 'access_token',
            refreshToken: 'refresh_token'
        })
    })
})