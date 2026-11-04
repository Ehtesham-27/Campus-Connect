import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import routes from './routes/index.js';
import healthRoutes from './routes/healthRoutes.js';
import { notFoundHandler } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { csrfProtection } from './middleware/csrfProtection.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// Trust reverse proxy (Render, Vercel, Heroku) for accurate client IP in rate limiting & secure cookies
app.set('trust proxy', 1);

// Explicitly allowed origins (credentialed CORS strictly permits only these origins)
const allowedOrigins = [
  ENV.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

// CORS configuration supporting credentials and cookies
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, `CORS policy violation: origin '${origin}' is not authorized.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Cookie parser for JWT in HttpOnly cookies
app.use(cookieParser());

// CSRF verification for cookie-authenticated state-changing requests
app.use(csrfProtection);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root health check convenience route
app.use('/health', healthRoutes);

// Versioned API routes (/api/v1) and convenience alias (/api)
app.use('/api/v1', routes);
app.use('/api', routes);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
