import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password";

describe("Password Utilities", () => {
  it("hashes a plain password into a valid bcrypt hash", async () => {
    const raw = "SuperSecureP@ssw0rd!";
    const hash = await hashPassword(raw);

    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("successfully verifies correct password against hash", async () => {
    const raw = "correct-password-123";
    const hash = await hashPassword(raw);

    const isValid = await verifyPassword(raw, hash);
    expect(isValid).toBe(true);
  });

  it("fails verification for incorrect password", async () => {
    const raw = "correct-password-123";
    const hash = await hashPassword(raw);

    const isValid = await verifyPassword("wrong-password", hash);
    expect(isValid).toBe(false);
  });
});
