import fastify, { FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

import dbPlugin from './plugins/db';
import swaggerPlugin from './plugins/swagger';
import authPlugin from './plugins/auth';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true, // Use default Pino logger
  });

  // Add Zod type provider
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // Security Middlewares
  await app.register(helmet, { global: true });
  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Custom Plugins
  await app.register(dbPlugin);
  await app.register(swaggerPlugin);
  await app.register(authPlugin);

  // Modules
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(usersRoutes, { prefix: '/api/v1/users' });

  // Health check endpoint
  app.get('/api/v1/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}
