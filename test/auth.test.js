import { loginHandler } from '../services/auth.service.js'
import * as authRepository from '../repositories/user.repository.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../services/jwt.service.js'

jest.mock('../repositories/user.repository.js')
jest.mock('bcryptjs')
jest.mock('../services/jwt.service.js')

describe('loginHandler', () => {
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

    test('should throw error if user not found', async () => {
        authRepository.findByEmail.mockResolvedValue(null)

        await expect(loginHandler({
            email: 'test1@gmail.com',
            password: 'test'
        })).rejects.toThrow('Invalid email or password')
    })

    test('should throw error if user inactive', async () => {
        authRepository.findByEmail.mockResolvedValue({
            ...mockUser,
            status: 'INACTIVE'
        })

        await expect(loginHandler({
            email: 'test@gmail.com',
            password: '123456'
        })).rejects.toThrow('Account is not active')
    })

    test('should throw error if password incorrect', async () => {
        authRepository.findByEmail.mockResolvedValue(mockUser)
        bcrypt.compare.mockResolvedValue(false)

        await expect(loginHandler({
            email: 'test@gmail.com',
            password: 'wrongpass'
        })).rejects.toThrow('Invalid email or password')
    })

    test('should login successfully', async () => {
        authRepository.findByEmail.mockResolvedValue(mockUser)
        bcrypt.compare.mockResolvedValue(true)

        generateToken.mockReturnValue({
            accessToken: 'access_token',
            refreshToken: 'refresh_token'
        })

        authRepository.updateRefreshToken = jest.fn()

        const result = await loginHandler({
            email: 'test@gmail.com',
            password: 'test'
        })

        expect(result.user).toEqual(mockUser)
        expect(result.accessToken).toBe('access_token')
        expect(result.refreshToken).toBe('refresh_token')

        expect(authRepository.updateRefreshToken)
            .toHaveBeenCalledWith(1n, 'refresh_token')
    })
})