import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    pgPool: Pool;
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.$connect();

  fastify.decorate('prisma', prisma);
  fastify.decorate('pgPool', pool);

  fastify.addHook('onClose', async (server) => {
    try {
      await server.prisma.$disconnect();
    } catch (err) {
      server.log.error(err, 'Error disconnecting Prisma');
    }
    try {
      await pool.end();
    } catch (err) {
      server.log.error(err, 'Error closing PG connection pool');
    }
  });
};

export default fp(dbPlugin);
