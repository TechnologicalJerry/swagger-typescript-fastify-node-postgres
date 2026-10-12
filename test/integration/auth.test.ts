import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { getTestApp, closeTestApp } from "../helpers/test-app";
import { resetDatabase } from "../helpers/db-reset";

describe("Auth Endpoints Integration", () => {
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

  describe("Validation & Guards", () => {
    it("rejects registration with invalid email or short password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          name: "J",
          email: "not-an-email",
          password: "123",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation failed");
    });

    it("rejects login with invalid email format", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "bad-email",
          password: "some-password",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it("rejects refresh with empty token string", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: {
          refreshToken: "",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("rejects unauthenticated logout request", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/logout",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("Database Lifecycle (when DB is active)", () => {
    it("registers a new user and returns tokens", async () => {
      if (!dbAvailable) return;

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          name: "Jane Doe",
          email: "jane@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("accessToken");
      expect(body.data).toHaveProperty("refreshToken");
      expect(body.data.user.email).toBe("jane@example.com");
    });

    it("rejects duplicate email with 409 Conflict", async () => {
      if (!dbAvailable) return;

      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          name: "Original",
          email: "duplicate@example.com",
          password: "password123",
        },
      });

      const duplicateResponse = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          name: "Copy",
          email: "duplicate@example.com",
          password: "password123",
        },
      });

      expect(duplicateResponse.statusCode).toBe(409);
      const body = JSON.parse(duplicateResponse.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain("Email already in use");
    });

    it("authenticates user and executes refresh token rotation", async () => {
      if (!dbAvailable) return;

      // Register
      const regRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          name: "Refresher",
          email: "refresher@example.com",
          password: "password123",
        },
      });
      const initialRefreshToken = JSON.parse(regRes.body).data.refreshToken;

      // Refresh
      const refreshRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: {
          refreshToken: initialRefreshToken,
        },
      });

      expect(refreshRes.statusCode).toBe(200);
      const refreshBody = JSON.parse(refreshRes.body);
      expect(refreshBody.data).toHaveProperty("accessToken");
      expect(refreshBody.data).toHaveProperty("refreshToken");

      // The old refresh token should now be revoked (cannot be reused)
      const reusedResponse = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: {
          refreshToken: initialRefreshToken,
        },
      });

      expect(reusedResponse.statusCode).toBe(401);
    });
  });
});
