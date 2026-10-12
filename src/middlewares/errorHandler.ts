import { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: "Validation failed",
      error: error.issues,
    });
  }

  // Fastify schema validation errors
  const fastifyError = error as FastifyError;
  if (fastifyError.validation) {
    return reply.status(400).send({
      success: false,
      message: "Validation failed",
      error: fastifyError.validation,
    });
  }

  // Handle Prisma Client Known Request Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") || "field";
      return reply.status(409).send({
        success: false,
        message: `Unique constraint failed on: ${target}`,
      });
    }
    if (error.code === "P2025") {
      return reply.status(404).send({
        success: false,
        message: "Resource not found",
      });
    }
    if (error.code === "P2003") {
      return reply.status(400).send({
        success: false,
        message: "Foreign key constraint violation",
      });
    }
  }

  // Handle standard Fastify errors with explicit status code
  if (fastifyError.statusCode) {
    return reply.status(fastifyError.statusCode).send({
      success: false,
      message: fastifyError.message,
    });
  }

  // Handle generic / unexpected server errors
  request.log.error(error);
  return reply.status(500).send({
    success: false,
    message: "Internal server error",
  });
}
