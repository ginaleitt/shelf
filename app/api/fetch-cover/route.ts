/**
 * GET /api/fetch-cover?url=<encoded_url>
 * Fetches the og:image meta tag from the given URL server-side.
 * Returns { coverUrl: string } or { coverUrl: "" } if not found.
 */
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        // Mimic a browser to avoid bot-blocking
        "User-Agent":
          "Mozilla/5.0 (compatible; Shelf/1.0; +https://github.com/shelf)",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return NextResponse.json({ coverUrl: "" });
    }

    const html = await res.text();

    // Try og:image first, then twitter:image as fallback
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ??
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    const coverUrl = ogMatch?.[1] ?? "";

    return NextResponse.json({ coverUrl });
  } catch {
    // Timeout or network error — return empty gracefully
    return NextResponse.json({ coverUrl: "" });
  }
}
