import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

describe('Fastify Server Tests', () => {
  let app: FastifyInstance;

  before(async () => {
    app = await buildApp();
  });

  after(async () => {
    await app.close();
  });

  test('Swagger documentation endpoint is available', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/',
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'] || '', /text\/html/);
  });

  test('Registration validates input with Zod and rejects invalid body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'A', // too short (< 2)
        email: 'invalid-email',
        password: '123', // too short (< 6)
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
    assert.equal(body.message, 'Validation failed');
  });

  test('Login validates input with Zod and rejects invalid email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'not-an-email',
        password: 'password123',
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
  });

  test('Protected users endpoint rejects unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/users',
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
    assert.equal(body.message, 'Unauthorized');
  });

  test('Protected /me endpoint rejects unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/users/me',
    });

    assert.equal(response.statusCode, 401);
  });

  test('Refresh token endpoint validates input and rejects empty token with 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: {
        refreshToken: '',
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
    assert.equal(body.message, 'Validation failed');
  });

  test('Logout endpoint requires authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
    });

    assert.equal(response.statusCode, 401);
  });
});
