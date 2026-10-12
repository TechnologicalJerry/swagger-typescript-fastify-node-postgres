import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getMeHandler,
} from "./users.controller";
import {
  userListResponseSchema,
  singleUserResponseSchema,
  updateUserSchema,
  userIdParamSchema,
  genericUserResponseSchema,
} from "./users.schemas";

export default async function usersRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // Admin routes
  server.register(async (adminRoutes) => {
    adminRoutes.addHook("preValidation", fastify.requireAdmin);

    adminRoutes.get(
      "/",
      {
        schema: {
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          response: { 200: userListResponseSchema },
        },
      },
      getUsersHandler,
    );

    adminRoutes.get(
      "/:id",
      {
        schema: {
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          params: userIdParamSchema,
          response: { 200: singleUserResponseSchema },
        },
      },
      getUserHandler,
    );

    adminRoutes.patch(
      "/:id",
      {
        schema: {
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          params: userIdParamSchema,
          body: updateUserSchema,
          response: { 200: singleUserResponseSchema },
        },
      },
      updateUserHandler,
    );

    adminRoutes.delete(
      "/:id",
      {
        schema: {
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          params: userIdParamSchema,
          response: { 200: genericUserResponseSchema },
        },
      },
      deleteUserHandler,
    );
  });

  // Authenticated user profile routes
  server.register(async (userRoutes) => {
    userRoutes.addHook("preValidation", fastify.authenticate);

    userRoutes.get(
      "/me",
      {
        schema: {
          tags: ["Users"],
          security: [{ bearerAuth: [] }],
          response: { 200: singleUserResponseSchema },
        },
      },
      getMeHandler,
    );
  });
}
