import crypto from "crypto";

/**
 * Generate a cryptographically secure random token string.
 */
export function generateToken(byteLength = 40): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Create a deterministic SHA-256 hash of a token.
 * This allows safe O(1) indexed lookup in the database without storing plaintext tokens.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
