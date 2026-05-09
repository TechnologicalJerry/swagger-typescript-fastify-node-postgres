import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: 'Validation failed',
      error: error.issues,
    });
  }

  // Fastify schema validation errors
  if (error.validation) {
      return reply.status(400).send({
      success: false,
      message: 'Validation failed',
      error: error.validation,
    });
  }

  // Handle standard Fastify errors
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
    });
  }

  // Handle generic errors
  request.log.error(error);
  reply.status(500).send({
    success: false,
    message: 'Internal server error',
  });
}
