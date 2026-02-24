/**
 * GET /api/admin/bookmarks
 * Returns all bookmarks (public + private) for the admin browse table.
 * Auth required.
 */
import { NextResponse } from "next/server";
import { getSheetsClient, getSheetId } from "@/lib/sheets";
import { rawToBookmark, rowToRaw } from "@/lib/bookmarkUtils";
import { validateSession } from "@/lib/auth";
import { Bookmark } from "@/types/bookmark";

const RANGE = "Bookmarks!A2:J";

export async function GET(request: Request) {
  const authError = validateSession(request);
  if (authError) return authError;

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

    const bookmarks: Bookmark[] = rows.map(rowToRaw).map(rawToBookmark);
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("GET /api/admin/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

