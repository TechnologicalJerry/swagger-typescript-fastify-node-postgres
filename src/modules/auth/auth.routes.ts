import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
} from "./auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  authResponseSchema,
  genericResponseSchema,
} from "./auth.schemas";

export default async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // Stricter rate limits for authentication endpoints to prevent brute-force attacks
  const authRateLimitConfig = {
    rateLimit: {
      max: 10,
      timeWindow: "1 minute",
    },
  };

  server.post(
    "/register",
    {
      config: authRateLimitConfig,
      schema: {
        tags: ["Auth"],
        body: registerSchema,
        response: {
          201: authResponseSchema,
          409: authResponseSchema,
        },
      },
    },
    registerHandler,
  );

  server.post(
    "/login",
    {
      config: authRateLimitConfig,
      schema: {
        tags: ["Auth"],
        body: loginSchema,
        response: {
          200: authResponseSchema,
          401: authResponseSchema,
        },
      },
    },
    loginHandler,
  );

  server.post(
    "/refresh",
    {
      config: authRateLimitConfig,
      schema: {
        tags: ["Auth"],
        body: refreshSchema,
        response: {
          200: authResponseSchema,
          401: authResponseSchema,
        },
      },
    },
    refreshHandler,
  );

  server.post(
    "/logout",
    {
      preValidation: [fastify.authenticate],
      schema: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        body: logoutSchema,
        response: {
          200: genericResponseSchema,
        },
      },
    },
    logoutHandler,
  );
}
