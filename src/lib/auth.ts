import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";
import { verifyToken, generateToken } from "@/lib/jwt";

export { generateToken, verifyToken };

/**
 * Extract the authenticated user from the request.
 * Checks the Authorization header (Bearer token) first, then cookies.
 * Returns the user document (without password) or null if not authenticated.
 */
export async function getAuthUser(request: NextRequest): Promise<IUser | null> {
  let token: string | null = null;

  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie
  if (!token) {
    token = request.cookies.get("token")?.value || null;
  }

  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return null;
  }

  await connectDB();
  const user = await User.findById(decoded.userId).select("-password");
  return user;
}

/**
 * Helper to create a JSON error response for unauthenticated requests.
 */
export function unauthorizedResponse(message: string = "Authentication required") {
  return Response.json({ error: message }, { status: 401 });
}
