/**
 * GET /api/categories
 * Returns the list of categories from the Categories sheet tab.
 * No auth required — used on both public page and admin.
 */
import { NextResponse } from "next/server";
import { getSheetsClient, getSheetId } from "@/lib/sheets";

const RANGE = "Categories!A2:A";

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const sheetId = getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
    });

    const rows = response.data.values as string[][] | undefined;
    if (!rows || rows.length === 0) return NextResponse.json([]);

    const categories: string[] = rows
      .map((row) => row[0]?.trim())
      .filter(Boolean);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
