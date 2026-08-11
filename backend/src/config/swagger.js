import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Traffic Management System API',
    version: '1.0.0',
    description:
      'Production-ready backend API for managing e-challans (traffic violation tickets), vehicles, owners, payments, and analytics.',
    contact: { name: 'API Support' },
  },
  servers: [
    {
      url: `${env.appUrl}/api/${env.apiVersion}`,
      description: `${env.nodeEnv} server`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
          errors: { type: 'object', nullable: true },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '..', 'routes', '*.routes.js')],
};

export const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
