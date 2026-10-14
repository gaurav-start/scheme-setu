import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// Security and utility middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Skip Morgan HTTP logging during test runs
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health endpoint handler
const getHealthStatus = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'OK',
    message: 'SchemeSetu API Server is operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStateMap[mongoose.connection.readyState] || 'unknown',
  });
};

// Root & Health endpoints
app.get('/', getHealthStatus);
app.get('/health', getHealthStatus);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/profile', profileRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
