import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db.js';
import authRoutes from './routes/auth.js';
import tripsRoutes from './routes/trips.js';
import requestsRoutes from './routes/requests.js';
import conversationsRoutes from './routes/conversations.js';
import staysRoutes from './routes/stays.js';
import storiesRoutes from './routes/stories.js';
import notificationsRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Database Connectivity Probe
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let isHealthy = true;

  try {
    // Safe, read-only connectivity probe
    await prisma.$queryRawUnsafe('SELECT 1 as connected');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'unreachable';
    isHealthy = false;
  }

  const statusCode = isHealthy ? 200 : 503;
  return res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'ChaloBuddy Core API',
    version: '1.0.0',
    database: dbStatus,
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/stays', staysRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred. Please try again.',
  });
});

// Start standalone server only when run directly from the CLI (not imported as a serverless handler)
const isDirectRun =
  !process.env.VERCEL &&
  process.env.NODE_ENV !== 'test' &&
  process.argv[1] &&
  (process.argv[1].endsWith('server/index.js') || process.argv[1].endsWith('server\\index.js'));

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`🚀 ChaloBuddy API server running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
