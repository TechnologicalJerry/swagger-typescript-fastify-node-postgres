import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { env } from '../config/env';

export default fp(async (fastify) => {
  if (!env.SWAGGER_ENABLED) {
    fastify.log.info('Swagger documentation is disabled');
    return;
  }

  const serverUrl = env.API_BASE_URL || `http://localhost:${env.PORT}`;

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify API',
        description: 'Production ready backend API',
        version: '1.0.0',
      },
      servers: [
        {
          url: serverUrl,
          description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
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
      },
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  });
});
