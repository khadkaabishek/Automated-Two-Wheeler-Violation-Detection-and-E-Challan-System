import app from './app.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import prisma from './config/database.js';

let server;

const startServer = async () => {
  try {
    // Verify database connectivity before accepting traffic.
    await prisma.$connect();
    logger.info('Database connection established');

    server = app.listen(env.port, () => {
      logger.info(`${env.appName} running in ${env.nodeEnv} mode on port ${env.port}`);
      logger.info(`API base URL: ${env.appUrl}/api/${env.apiVersion}`);
      logger.info(`Swagger docs: ${env.appUrl}/api-docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed. Process terminated.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
  // Let the process exit via the uncaughtException-style handling below.
  throw reason instanceof Error ? reason : new Error(String(reason));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
  process.exit(1);
});

startServer();
