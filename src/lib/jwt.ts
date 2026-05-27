import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "pin-ai-aesthetic-blueprints-jwt-secret-2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);
const JWT_EXPIRES_IN = "7d";

/**
 * Generate a JWT token for a user.
 */
export async function generateToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or null if invalid.
 */
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { userId: string };
  } catch {
    return null;
  }
}
