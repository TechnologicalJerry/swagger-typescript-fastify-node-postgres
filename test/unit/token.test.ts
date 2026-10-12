import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "../../src/utils/token";

describe("Token Utilities", () => {
  describe("generateToken", () => {
    it("generates a random hex string of default length (40 bytes = 80 hex chars)", () => {
      const token = generateToken();
      expect(typeof token).toBe("string");
      expect(token).toHaveLength(80);
    });

    it("generates a random hex string with custom byte length", () => {
      const token = generateToken(16);
      expect(token).toHaveLength(32);
    });

    it("produces unique tokens across calls", () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("hashToken", () => {
    it("produces a 64-character SHA-256 hex digest", () => {
      const hash = hashToken("my-secret-token");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("is deterministic: same input produces the exact same hash", () => {
      const token = "persistent-sample-token-12345";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it("produces distinct hashes for different inputs", () => {
      const hashA = hashToken("tokenA");
      const hashB = hashToken("tokenB");
      expect(hashA).not.toBe(hashB);
    });
  });
});
