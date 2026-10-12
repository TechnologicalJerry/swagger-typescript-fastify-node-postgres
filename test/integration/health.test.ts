import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { getTestApp, closeTestApp } from "../helpers/test-app";

describe("Health and Documentation Endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it("serves Swagger documentation at /docs/", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs/",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
  });

  it("responds on /api/v1/health endpoint", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/health",
    });

    // If DB is connected -> 200, if offline -> 503
    expect([200, 503]).toContain(response.statusCode);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("database");
    expect(body).toHaveProperty("timestamp");
  });
});
