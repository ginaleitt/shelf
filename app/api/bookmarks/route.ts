/**
 * GET /api/bookmarks
 * Returns all public bookmarks from the Sheet.
 * No auth required — safe for public page consumption.
 */
import { NextResponse } from "next/server";
import { getSheetsClient, getSheetId } from "@/lib/sheets";
import { bookmarkToRow, rawToBookmark, rowToRaw } from "@/lib/bookmarkUtils";
import { validateSession } from "@/lib/auth";
import { Bookmark } from "@/types/bookmark";
import { randomUUID } from "crypto";

const RANGE = "Bookmarks!A2:J";

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const sheetId = getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
    });

    const rows = response.data.values as string[][] | undefined;
    if (!rows || rows.length === 0) {
      return NextResponse.json([]);
    }

    const bookmarks: Bookmark[] = rows
      .map(rowToRaw)
      .map(rawToBookmark)
      .filter((b) => b.visibility === "public");

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("GET /api/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookmarks
 * Creates a new bookmark row. Requires valid session token in Authorization header.
 */
export async function POST(request: Request) {
  const authError = validateSession(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as Partial<Bookmark>;

    const newBookmark: Bookmark = {
      id: randomUUID(),
      title: body.title ?? "",
      url: body.url ?? "",
      category: body.category ?? "Book",
      progress: body.progress ?? "",
      notes: body.notes ?? "",
      tags: body.tags ?? [],
      coverUrl: body.coverUrl ?? "",
      visibility: body.visibility ?? "private",
      dateAdded: new Date().toISOString(),
    };

    const sheets = getSheetsClient();
    const sheetId = getSheetId();

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: {
        values: [bookmarkToRow(newBookmark)],
      },
    });

    return NextResponse.json(newBookmark, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}

