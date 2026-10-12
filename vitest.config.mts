import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    testTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/server.ts"],
    },
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "supersecret_jwt_key_test_environment_123456789",
    },
  },
});
