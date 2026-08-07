import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import logger from './config/logger.js';
import swaggerSpec from './config/swagger.js';
import apiRoutes from './routes/index.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import { errorConverter, errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ---- Security & core middleware ----
// Default Cross-Origin-Resource-Policy is same-origin, which blocks the
// frontend (a different origin/port) from loading images served from
// /uploads below — evidence photos, plate previews, avatars, etc. This app
// is intentionally a separate SPA + API pair, so that's relaxed here.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// app.use(
//   cors({
//     origin: env.cors.origin,
//     credentials: true,
//   })
// );
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Logging ----
const morganFormat = env.isDevelopment ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// ---- Rate limiting (global) ----
app.use(`/api/${env.apiVersion}`, globalLimiter);

// ---- Static file serving for uploads ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- API Documentation ----
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ---- Root ----
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${env.appName} API is running`,
    data: {
      version: env.apiVersion,
      docs: '/api-docs',
    },
    errors: null,
  });
});

// ---- API routes ----
app.use(`/api/${env.apiVersion}`, apiRoutes);

// ---- 404 + error handling (must be last) ----
app.use(notFoundHandler);
app.use(errorConverter);
app.use(errorHandler);

export default app;
