import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";

let testApp: FastifyInstance | null = null;

export async function getTestApp(): Promise<FastifyInstance> {
  if (!testApp) {
    testApp = await buildApp();
  }
  return testApp;
}

export async function closeTestApp(): Promise<void> {
  if (testApp) {
    await testApp.close();
    testApp = null;
  }
}
