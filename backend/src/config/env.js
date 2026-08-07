import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`FATAL ERROR: Missing required environment variable ${key}`);
    process.exit(1);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  appName: process.env.APP_NAME || 'Smart Traffic Violation Management System',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000,
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    maxVideoSizeMb: parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 50,
    dir: process.env.UPLOAD_DIR || 'src/uploads',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromName: process.env.SMTP_FROM_NAME || 'Smart Traffic System',
    fromEmail: process.env.SMTP_FROM_EMAIL,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  mlService: {
    // Remote inference service (see /ml-service) — a separate Python/FastAPI
    // process wrapping the trained YOLOv8 helmet + plate detection models.
    // Left unset in environments that don't run it; the AI detection status
    // endpoint degrades gracefully to "unavailable" rather than erroring.
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    timeoutMs: parseInt(process.env.ML_SERVICE_TIMEOUT_MS, 10) || 15000,
    // Video is sampled frame-by-frame server-side (up to 60 frames, each
    // running the full staged pipeline) — even a short clip can take well
    // over a minute on CPU, so this needs a much longer allowance than a
    // single photo.
    videoTimeoutMs: parseInt(process.env.ML_SERVICE_VIDEO_TIMEOUT_MS, 10) || 300000,
  },

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
};

export default env;
