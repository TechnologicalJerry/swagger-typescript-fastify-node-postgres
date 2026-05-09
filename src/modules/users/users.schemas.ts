import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  createdAt: z.date().transform(d => d.toISOString()).or(z.string()),
  updatedAt: z.date().transform(d => d.toISOString()).or(z.string()),
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
  name: z.string().min(2).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});
