import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import logger from './logger.js';

const prisma =
  global.__prisma__ ||
  new PrismaClient({
    log: env.isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
  });

if (env.isDevelopment) {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
  });
  global.__prisma__ = prisma;
}

export default prisma;
