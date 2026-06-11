import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { prisma } from '../../prisma.js';

jest.mock('../../prisma.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const TEST_SECRET = 'test-middleware-secret';

beforeAll(() => {
  process.env.JWT_ACCESS_TOKEN_SECRET = TEST_SECRET;
});

function createMockReqResNext(cookieToken) {
  const req = {
    cookies: { accessToken: cookieToken },
    originalUrl: '/api/test',
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

function signToken(payload, options = {}) {
  return jwt.sign(payload, TEST_SECRET, options);
}

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no access token cookie is present', async () => {
    const { req, res, next } = createMockReqResNext(undefined);
    req.cookies = {};

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Missing access token',
        errorCode: 'AUTH_006',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is malformed', async () => {
    const { req, res, next } = createMockReqResNext('not.a.real.token');

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        errorCode: 'AUTH_007',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token has expired', async () => {
    const token = signToken({ sub: '1' }, { expiresIn: '0s' });
    await new Promise((r) => setTimeout(r, 1100));

    const { req, res, next } = createMockReqResNext(token);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Token has expired',
        errorCode: 'AUTH_008',
      })
    );
  });

  it('should return 401 when user does not exist in the database', async () => {
    const token = signToken({ sub: '999' }, { expiresIn: '1h' });
    prisma.user.findUnique.mockResolvedValue(null);

    const { req, res, next } = createMockReqResNext(token);

    await authMiddleware(req, res, next);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User not found',
        errorCode: 'AUTH_007',
      })
    );
  });

  it('should return 403 when user account is LOCKED', async () => {
    const token = signToken({ sub: '1' }, { expiresIn: '1h' });
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'locked@example.com',
      status: 'LOCKED',
    });

    const { req, res, next } = createMockReqResNext(token);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Account is locked',
        errorCode: 'AUTH_005',
      })
    );
  });

  it('should return 403 when user account is not ACTIVE', async () => {
    const token = signToken({ sub: '1' }, { expiresIn: '1h' });
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'suspended@example.com',
      status: 'SUSPENDED',
    });

    const { req, res, next } = createMockReqResNext(token);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Account is not active',
        errorCode: 'AUTH_004',
      })
    );
  });

  it('should call next() and attach user to req when token is valid and user is ACTIVE', async () => {
    const activeUser = {
      id: 1,
      email: 'active@example.com',
      name: 'Active User',
      status: 'ACTIVE',
    };
    const token = signToken({ sub: '1' }, { expiresIn: '1h' });
    prisma.user.findUnique.mockResolvedValue(activeUser);

    const { req, res, next } = createMockReqResNext(token);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(activeUser);
    expect(res.status).not.toHaveBeenCalled();
  });
});
