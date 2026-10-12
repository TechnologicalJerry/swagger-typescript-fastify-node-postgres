import { FastifyRequest, FastifyReply } from 'fastify';
import { formatResponse } from '../../utils/response';
import { z } from 'zod';
import { userIdParamSchema, updateUserSchema } from './users.schemas';

export async function getUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const prisma = request.server.prisma;
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return reply.send(formatResponse(true, 'Users fetched', users));
}

export async function getUserHandler(
  request: FastifyRequest<{ Params: z.infer<typeof userIdParamSchema> }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const prisma = request.server.prisma;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  if (!user) return reply.status(404).send(formatResponse(false, 'User not found'));
  return reply.send(formatResponse(true, 'User fetched', user));
}

export async function updateUserHandler(
  request: FastifyRequest<{
    Params: z.infer<typeof userIdParamSchema>;
    Body: z.infer<typeof updateUserSchema>;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const prisma = request.server.prisma;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: request.body,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return reply.send(formatResponse(true, 'User updated', user));
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return reply.status(404).send(formatResponse(false, 'User not found'));
    }
    throw err;
  }
}

export async function deleteUserHandler(
  request: FastifyRequest<{ Params: z.infer<typeof userIdParamSchema> }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const prisma = request.server.prisma;
  try {
    await prisma.user.delete({ where: { id } });
    return reply.send(formatResponse(true, 'User deleted'));
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return reply.status(404).send(formatResponse(false, 'User not found'));
    }
    throw err;
  }
}

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const prisma = request.server.prisma;
  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  if (!user) return reply.status(404).send(formatResponse(false, 'User not found'));
  return reply.send(formatResponse(true, 'Profile fetched', user));
}
