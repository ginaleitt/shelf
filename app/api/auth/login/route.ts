/**
 * POST /api/auth/login — validates password, returns signed token
 * DELETE /api/auth/login — logout (client just discards the token)
 */
import { NextResponse } from "next/server";
import { createToken } from "@/lib/tokenStore";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password: string };

    if (!body.password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD is not set");
    }

    if (body.password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = createToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  // Stateless tokens — nothing to invalidate server-side
  return NextResponse.json({ success: true });
}
