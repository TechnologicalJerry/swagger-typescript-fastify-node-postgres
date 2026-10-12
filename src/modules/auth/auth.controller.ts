import { FastifyRequest, FastifyReply } from 'fastify';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateToken, hashToken } from '../../utils/token';
import { formatResponse } from '../../utils/response';
import { z } from 'zod';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schemas';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export async function registerHandler(
  request: FastifyRequest<{ Body: z.infer<typeof registerSchema> }>,
  reply: FastifyReply
) {
  const { name, email, password } = request.body;
  const prisma = request.server.prisma;

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = request.server.jwt.sign(payload, { expiresIn: '15m' });
    const rawRefreshToken = generateToken();
    const tokenHash = hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return reply.status(201).send(
      formatResponse(true, 'User registered successfully', {
        accessToken,
        refreshToken: rawRefreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      })
    );
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return reply.status(409).send(formatResponse(false, 'Email already in use'));
    }
    throw err;
  }
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
  const rawRefreshToken = generateToken();
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return reply.send(
    formatResponse(true, 'Login successful', {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  );
}

export async function refreshHandler(
  request: FastifyRequest<{ Body: z.infer<typeof refreshSchema> }>,
  reply: FastifyReply
) {
  const { refreshToken } = request.body;
  const prisma = request.server.prisma;

  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    return reply.status(401).send(formatResponse(false, 'Invalid or expired refresh token'));
  }

  // Refresh token rotation: Invalidate old refresh token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  // Issue new access & refresh tokens
  const payload = {
    id: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  };
  const accessToken = request.server.jwt.sign(payload, { expiresIn: '15m' });
  const newRawRefreshToken = generateToken();
  const newTokenHash = hashToken(newRawRefreshToken);

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId: storedToken.user.id,
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
    },
  });

  return reply.send(
    formatResponse(true, 'Tokens refreshed successfully', {
      accessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
    })
  );
}

export async function logoutHandler(
  request: FastifyRequest<{ Body: z.infer<typeof logoutSchema> }>,
  reply: FastifyReply
) {
  const prisma = request.server.prisma;
  const refreshToken = request.body?.refreshToken;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } else if (request.user?.id) {
    await prisma.refreshToken.updateMany({
      where: { userId: request.user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  return reply.send(formatResponse(true, 'Logout successful'));
}
