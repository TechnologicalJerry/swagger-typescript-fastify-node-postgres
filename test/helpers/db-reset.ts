import { PrismaClient } from "@prisma/client";

/**
 * Truncates user and token data between integration tests.
 */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (err) {
    // Gracefully handle if DB is not connected during offline/unit tests
    console.warn("Database reset skipped (DB unreachable):", err);
  }
}
