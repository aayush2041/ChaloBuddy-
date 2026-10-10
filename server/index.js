import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ChaloBuddy Core API',
    version: '1.0.0',
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

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 ChaloBuddy API server running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
