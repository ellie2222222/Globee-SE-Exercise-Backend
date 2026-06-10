import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const path = req.originalUrl || req.url;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Missing access token',
      path,
      timestamp: new Date().toISOString(),
      errorCode: 'AUTH_006'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    // Check if user still exists and is ACTIVE
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Unauthorized',
        message: 'User not found',
        path,
        timestamp: new Date().toISOString(),
        errorCode: 'AUTH_007'
      });
    }

    if (user.status !== 'ACTIVE') {
      const isLocked = user.status === 'LOCKED';
      return res.status(403).json({
        success: false,
        status: 403,
        error: 'Forbidden',
        message: isLocked ? 'Account is locked' : 'Account is not active',
        path,
        timestamp: new Date().toISOString(),
        errorCode: isLocked ? 'AUTH_005' : 'AUTH_004'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Unauthorized',
        message: 'Token has expired',
        path,
        timestamp: new Date().toISOString(),
        errorCode: 'AUTH_008'
      });
    }

    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid token',
      path,
      timestamp: new Date().toISOString(),
      errorCode: 'AUTH_007'
    });
  }
};
