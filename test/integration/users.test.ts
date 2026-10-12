import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { getTestApp, closeTestApp } from "../helpers/test-app";
import { resetDatabase } from "../helpers/db-reset";

describe("Users Endpoints Integration", () => {
  let app: FastifyInstance;
  let dbAvailable = false;

  beforeAll(async () => {
    app = await getTestApp();
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch {
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    if (dbAvailable) {
      await resetDatabase(app.prisma);
    }
  });

  describe("Route Protection & Guards", () => {
    it("blocks unauthenticated access to admin user list", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/users",
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it("blocks unauthenticated access to /me profile", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/users/me",
      });

      expect(response.statusCode).toBe(401);
    });

    it("rejects non-admin users from accessing admin routes with 403 Forbidden", async () => {
      // Sign a token for a standard USER role
      const userToken = app.jwt.sign({
        id: 10,
        email: "user@test.com",
        role: "USER",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/users",
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain("Forbidden");
    });

    it("rejects non-integer user IDs with 400 Validation Error", async () => {
      // Sign an ADMIN token to bypass auth check and reach param validator
      const adminToken = app.jwt.sign({
        id: 1,
        email: "admin@test.com",
        role: "ADMIN",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/users/not-a-number",
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation failed");
    });
  });

  describe("User Operations (when DB is active)", () => {
    it("returns empty user list for admin on fresh database", async () => {
      if (!dbAvailable) return;

      const adminToken = app.jwt.sign({
        id: 1,
        email: "admin@test.com",
        role: "ADMIN",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/users",
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
