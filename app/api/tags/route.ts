/**
 * GET /api/tags
 * Returns the list of predefined tags from the Tags sheet.
 * No auth required — tags are used on the public page for filtering.
 *
 * POST /api/tags
 * Adds a new tag to the Tags sheet. Auth required.
 *
 * DELETE /api/tags?tag=<tagname>
 * Removes a tag from the Tags sheet. Auth required.
 */
import { NextResponse } from "next/server";
import { getSheetsClient, getSheetId } from "@/lib/sheets";

const RANGE = "Tags!A2:A";

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

    const tags: string[] = rows
      .map((row) => row[0]?.trim())
      .filter(Boolean);

    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = validateSession(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as { tag: string };
    const tag = body.tag?.trim();
    if (!tag) {
      return NextResponse.json({ error: "Tag is required" }, { status: 400 });
    }

    const sheets = getSheetsClient();
    const sheetId = getSheetId();

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values: [[tag]] },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tags error:", error);
    return NextResponse.json({ error: "Failed to add tag" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = validateSession(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const tagToDelete = searchParams.get("tag")?.trim();
    if (!tagToDelete) {
      return NextResponse.json({ error: "Tag query param required" }, { status: 400 });
    }

    const sheets = getSheetsClient();
    const sheetId = getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
    });

    const rows = response.data.values as string[][] | undefined;
    if (!rows) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    const rowIndex = rows.findIndex((row) => row[0]?.trim() === tagToDelete);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const tagsSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Tags"
    );
    const sheetNumericId = tagsSheet?.properties?.sheetId ?? 1;

    // rowIndex is 0-based within data rows; add 1 to account for header
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetNumericId,
                dimension: "ROWS",
                startIndex: rowIndex + 1,
                endIndex: rowIndex + 2,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tags error:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}

function validateSession(request: Request): NextResponse | null {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const validToken = process.env.SESSION_SECRET;
  if (!token || token !== validToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
