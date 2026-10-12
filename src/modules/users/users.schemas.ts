import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive("User ID must be a positive integer"),
});

export const userResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  createdAt: z
    .date()
    .transform((d) => d.toISOString())
    .or(z.string()),
  updatedAt: z
    .date()
    .transform((d) => d.toISOString())
    .or(z.string()),
});

export const userListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(userResponseSchema),
});

export const singleUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: userResponseSchema,
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const genericUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
