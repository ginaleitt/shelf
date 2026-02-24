/**
 * POST /api/auth/login
 * Compares submitted password against ADMIN_PASSWORD env var.
 * Returns a session token on success.
 */
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addToken, removeToken } from "@/lib/tokenStore";

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

    const token = randomUUID();
    addToken(token);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (token) removeToken(token);
  return NextResponse.json({ success: true });
}
