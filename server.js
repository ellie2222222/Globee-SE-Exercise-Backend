import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import authRoute from './routes/auth.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.path}`);
  next();
});

// app.post('/api/auth/login', login);
// app.post('/api/auth/refresh-token', refreshToken);
// app.post('/api/auth/logout', authMiddleware, logout);
app.use('/api/auth', authRoute);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: 'Not Found',
    message: 'Endpoint not found',
    path: req.originalUrl || req.url,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    errorCode: err.errorCode || 'SYSTEM_001',
    message: err.message || 'An unexpected system error occurred'
  });

  // res.status(500).json({
  //   success: false,
  //   status: 500,
  //   error: 'Internal Server Error',
  //   message: 'An unexpected system error occurred',
  //   path: req.originalUrl || req.url,
  //   timestamp: new Date().toISOString(),
  //   errorCode: 'SYSTEM_001'
  // });
});

async function startServer() {
  try {
    await db.initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal: Server failed to start due to database error:', err);
    process.exit(1);
  }
}

startServer();
