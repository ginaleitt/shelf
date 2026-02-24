/**
 * Shared auth middleware for protected API routes.
 * Validates the Bearer token from the Authorization header.
 * Import and call validateSession(request) at the top of any protected route handler.
 */
import { NextResponse } from "next/server";
import { isValidToken } from "@/lib/tokenStore";

export function validateSession(request: Request): NextResponse | null {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
