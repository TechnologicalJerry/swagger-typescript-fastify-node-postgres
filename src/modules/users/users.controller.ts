import { FastifyRequest, FastifyReply } from 'fastify';
import { formatResponse } from '../../utils/response';
import { z } from 'zod';
import { updateUserSchema } from './users.schemas';

export async function getUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const prisma = request.server.prisma;
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  return reply.send(formatResponse(true, 'Users fetched', users));
}

export async function getUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const id = parseInt(request.params.id);
  const prisma = request.server.prisma;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  if (!user) return reply.status(404).send(formatResponse(false, 'User not found'));
  return reply.send(formatResponse(true, 'User fetched', user));
}

export async function updateUserHandler(request: FastifyRequest<{ Params: { id: string }, Body: z.infer<typeof updateUserSchema> }>, reply: FastifyReply) {
  const id = parseInt(request.params.id);
  const prisma = request.server.prisma;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: request.body,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
    });
    return reply.send(formatResponse(true, 'User updated', user));
  } catch (err) {
    return reply.status(404).send(formatResponse(false, 'User not found'));
  }
}

export async function deleteUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const id = parseInt(request.params.id);
  const prisma = request.server.prisma;
  try {
    await prisma.user.delete({ where: { id } });
    return reply.send(formatResponse(true, 'User deleted'));
  } catch (err) {
    return reply.status(404).send(formatResponse(false, 'User not found'));
  }
}

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const prisma = request.server.prisma;
  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
  });
  return reply.send(formatResponse(true, 'Profile fetched', user));
}
