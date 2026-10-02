import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger/swaggerSpec';
import v1Router from './routes/v1';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { ENV } from './config/env';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // allow Swagger UI and 3D canvas inline scripts
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [ENV.CLIENT_WEB_URL, ENV.CLIENT_MOBILE_URL, 'http://localhost:3000', 'http://localhost:8081'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-razorpay-signature'],
    })
  );

  // Request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiter
  if (process.env.NODE_ENV !== 'test') {
    app.use('/api/', apiRateLimiter);
  }

  // Health check endpoint
  app.get(['/health', '/api/health'], (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'RoboVerse Core API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Swagger Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // Versioned API routes
  app.use('/api/v1', v1Router);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      },
    });
  });

  // Centralized Error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
