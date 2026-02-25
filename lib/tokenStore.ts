/**
 * Stateless token utilities using HMAC-SHA256.
 * No server-side storage needed — works across Vercel serverless instances.
 * Requires SESSION_SECRET env var.
 */
import { createHmac } from "crypto";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

/** Creates a signed token: base64(payload).signature */
export function createToken(): string {
  const payload = Buffer.from(JSON.stringify({ ts: Date.now() })).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Verifies a token was signed with SESSION_SECRET */
export function verifyToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  if (sig.length !== expected.length) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.equals(b);
}

// Keep these for backwards compatibility with any imports
export function addToken(_token: string): void {}
export function removeToken(_token: string): void {}
export function isValidToken(token: string | null | undefined): boolean {
  return verifyToken(token);
}
