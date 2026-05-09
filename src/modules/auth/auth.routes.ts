import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerHandler, loginHandler, refreshHandler, logoutHandler } from './auth.controller';
import { registerSchema, loginSchema, refreshSchema, authResponseSchema } from './auth.schemas';

export default async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.post('/register', {
    schema: {
      tags: ['Auth'],
      body: registerSchema,
      response: {
        201: authResponseSchema,
        409: authResponseSchema
      }
    }
  }, registerHandler);

  server.post('/login', {
    schema: {
      tags: ['Auth'],
      body: loginSchema,
      response: {
        200: authResponseSchema,
        401: authResponseSchema
      }
    }
  }, loginHandler);

  server.post('/refresh', {
    schema: {
      tags: ['Auth'],
      body: refreshSchema,
      response: {
        200: authResponseSchema,
        401: authResponseSchema
      }
    }
  }, refreshHandler);

  server.post('/logout', {
    preValidation: [fastify.authenticate],
    schema: {
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: authResponseSchema
      }
    }
  }, logoutHandler);
}
