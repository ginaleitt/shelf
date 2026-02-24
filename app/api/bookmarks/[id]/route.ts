/**
 * GET /api/bookmarks/[id] — fetch a single bookmark by ID (admin use)
 * PUT /api/bookmarks/[id] — update a bookmark (auth required)
 * DELETE /api/bookmarks/[id] — delete a bookmark (auth required)
 */
import { NextResponse } from "next/server";
import { getSheetsClient, getSheetId } from "@/lib/sheets";
import { bookmarkToRow, rawToBookmark, rowToRaw } from "@/lib/bookmarkUtils";
import { validateSession } from "@/lib/auth";
import { Bookmark } from "@/types/bookmark";

const RANGE = "Bookmarks!A2:J";

/** Fetches all rows and returns the row index (0-based) and parsed bookmark for a given ID */
async function findBookmarkRow(
  id: string
): Promise<{ rowIndex: number; bookmark: Bookmark; allRows: string[][] } | null> {
  const sheets = getSheetsClient();
  const sheetId = getSheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: RANGE,
  });

  const rows = response.data.values as string[][] | undefined;
  if (!rows) return null;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return null;

  return {
    rowIndex,
    bookmark: rawToBookmark(rowToRaw(rows[rowIndex])),
    allRows: rows,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await findBookmarkRow(id);
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result.bookmark);
  } catch (error) {
    console.error("GET /api/bookmarks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmark" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSession(request);
  if (authError) return authError;
  const { id } = await params;

  try {
    const result = await findBookmarkRow(id);
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await request.json()) as Partial<Bookmark>;
    const updated: Bookmark = {
      ...result.bookmark,
      ...body,
      id: id,
      dateAdded: result.bookmark.dateAdded,
    };

    const sheets = getSheetsClient();
    const sheetId = getSheetId();

    // Sheet rows are 1-indexed, plus 1 for the header row
    const sheetRow = result.rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Bookmarks!A${sheetRow}:J${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [bookmarkToRow(updated)],
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/bookmarks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateSession(request);
  if (authError) return authError;
  const { id } = await params;

  try {
    const result = await findBookmarkRow(id);
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sheets = getSheetsClient();
    const sheetId = getSheetId();

    // Get the spreadsheet to find the sheet's numeric ID for batchUpdate
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const bookmarksSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Bookmarks"
    );
    const sheetNumericId = bookmarksSheet?.properties?.sheetId ?? 0;

    // Delete the row using batchUpdate (deleteDimension)
    const sheetRow = result.rowIndex + 1; // 0-indexed, offset by header
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetNumericId,
                dimension: "ROWS",
                startIndex: sheetRow,
                endIndex: sheetRow + 1,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/bookmarks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}
