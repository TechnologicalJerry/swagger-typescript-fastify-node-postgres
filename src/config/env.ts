import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z
      .string()
      .url()
      .default('postgresql://postgres:postgres@localhost:5432/fastify_api?schema=public'),
    JWT_SECRET: z
      .string()
      .min(16, 'JWT_SECRET must be at least 16 characters long')
      .default('supersecret_jwt_key_change_in_production_123456789'),
    CORS_ORIGIN: z.string().default('*'),
    DB_POOL_MAX: z.coerce.number().default(10),
    DB_SSL: z
      .string()
      .transform((v) => v === 'true')
      .or(z.boolean())
      .default(false),
    SWAGGER_ENABLED: z
      .string()
      .transform((v) => v === 'true')
      .or(z.boolean())
      .default(true),
    API_BASE_URL: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!process.env.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'DATABASE_URL is required in production',
        });
      }
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'JWT_SECRET is required and must be at least 32 characters in production',
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
