import jwt from 'jsonwebtoken';
import { generateToken } from '../../services/jwt.service.js';

const TEST_ACCESS_SECRET = 'test-access-secret';
const TEST_REFRESH_SECRET = 'test-refresh-secret';

beforeAll(() => {
  process.env.JWT_ACCESS_TOKEN_SECRET = TEST_ACCESS_SECRET;
  process.env.JWT_REFRESH_TOKEN_SECRET = TEST_REFRESH_SECRET;
  process.env.ACCESS_TOKEN_EXPIRY = '15m';
  process.env.REFRESH_TOKEN_EXPIRY = '7d';
});

describe('JWT Service — generateToken', () => {
  const mockUser = {
    id: 42,
    email: 'test@example.com',
    name: 'Test User',
  };

  it('should return an object with accessToken and refreshToken', () => {
    const result = generateToken(mockUser);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(typeof result.accessToken).toBe('string');
    expect(typeof result.refreshToken).toBe('string');
  });

  it('should create a valid access token with correct payload', () => {
    const { accessToken } = generateToken(mockUser);
    const decoded = jwt.verify(accessToken, TEST_ACCESS_SECRET);

    expect(decoded.sub).toBe('42');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded).toHaveProperty('exp');
    expect(decoded).toHaveProperty('iat');
  });

  it('should create a valid refresh token with correct payload', () => {
    const { refreshToken } = generateToken(mockUser);
    const decoded = jwt.verify(refreshToken, TEST_REFRESH_SECRET);

    expect(decoded.sub).toBe('42');
    expect(decoded.email).toBeUndefined();
    expect(decoded).toHaveProperty('exp');
  });

  it('should fail verification with the wrong secret', () => {
    const { accessToken } = generateToken(mockUser);

    expect(() => {
      jwt.verify(accessToken, 'wrong-secret');
    }).toThrow();
  });

  it('should produce different tokens for different users', () => {
    const otherUser = { id: 99, email: 'other@example.com' };

    const tokens1 = generateToken(mockUser);
    const tokens2 = generateToken(otherUser);

    expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
    expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
  });

  it('should stringify the user id in the token subject', () => {
    const bigIdUser = { id: 9007199254740991, email: 'big@example.com' };
    const { accessToken } = generateToken(bigIdUser);
    const decoded = jwt.verify(accessToken, TEST_ACCESS_SECRET);

    expect(decoded.sub).toBe('9007199254740991');
    expect(typeof decoded.sub).toBe('string');
  });
});
