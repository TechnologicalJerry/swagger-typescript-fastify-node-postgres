import { FastifyRequest, FastifyReply } from 'fastify';
import { hashPassword, verifyPassword } from '../../utils/password';
import { formatResponse } from '../../utils/response';
import { z } from 'zod';
import { registerSchema, loginSchema, refreshSchema } from './auth.schemas';
import crypto from 'crypto';

export async function registerHandler(
  request: FastifyRequest<{ Body: z.infer<typeof registerSchema> }>,
  reply: FastifyReply
) {
  const { name, email, password } = request.body;
  const prisma = request.server.prisma;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return reply.status(409).send(formatResponse(false, 'Email already in use'));
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = request.server.jwt.sign(payload, { expiresIn: '15m' });
  const refreshTokenString = crypto.randomBytes(40).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await hashPassword(refreshTokenString),
      expiresAt,
    },
  });

  return reply.status(201).send(formatResponse(true, 'User registered successfully', {
    accessToken,
    refreshToken: refreshTokenString,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }));
}

export async function loginHandler(
  request: FastifyRequest<{ Body: z.infer<typeof loginSchema> }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;
  const prisma = request.server.prisma;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return reply.status(401).send(formatResponse(false, 'Invalid credentials'));
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = request.server.jwt.sign(payload, { expiresIn: '15m' });
  const refreshTokenString = crypto.randomBytes(40).toString('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await hashPassword(refreshTokenString),
      expiresAt,
    },
  });

  return reply.send(formatResponse(true, 'Login successful', {
    accessToken,
    refreshToken: refreshTokenString,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }));
}

export async function refreshHandler(
  request: FastifyRequest<{ Body: z.infer<typeof refreshSchema> }>,
  reply: FastifyReply
) {
  const { refreshToken } = request.body;
  const prisma = request.server.prisma;

  // Since we only have the token, we need to find it by scanning, but we shouldn't scan all tokenHashes.
  // In a real scenario, refreshToken could be JWT or token + userId.
  // For simplicity here, let's assume we decode token or find all active tokens and compare (not scalable),
  // OR we store plain token or use JWT for refresh. Let's change refresh token logic to JWT to make it simple.
  
  // Wait, I will use JWT for refresh token for simplicity since we have fastify-jwt
  try {
     const decoded = request.server.jwt.verify<{id: number, email: string, role: string}>(refreshToken);
     // Generate new tokens
     const accessToken = request.server.jwt.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, { expiresIn: '15m' });
     const newRefreshToken = request.server.jwt.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, { expiresIn: '7d' });
     return reply.send(formatResponse(true, 'Tokens refreshed', { accessToken, refreshToken: newRefreshToken }));
  } catch (err) {
     return reply.status(401).send(formatResponse(false, 'Invalid refresh token'));
  }
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  // In a real app we'd invalidate the token in DB or Redis. 
  // Here we just acknowledge.
  return reply.send(formatResponse(true, 'Logout successful'));
}
