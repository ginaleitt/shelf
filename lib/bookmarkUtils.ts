/**
 * Converts raw Sheet row arrays into typed Bookmark objects and back.
 */
import { Bookmark, Category, RawBookmarkRow, Visibility } from "@/types/bookmark";

/** Column order must match the Sheet headers exactly */
const COLUMNS = [
  "ID", "Title", "URL", "Category", "Progress",
  "Notes", "Tags", "CoverURL", "Visibility", "DateAdded",
] as const;

/** Converts a raw row array (from Sheets API values) into a typed RawBookmarkRow */
export function rowToRaw(row: string[]): RawBookmarkRow {
  const obj: Record<string, string> = {};
  COLUMNS.forEach((col, i) => {
    obj[col] = row[i] ?? "";
  });
  return obj as RawBookmarkRow;
}

/** Converts a RawBookmarkRow into a typed Bookmark */
export function rawToBookmark(raw: RawBookmarkRow): Bookmark {
  return {
    id: raw.ID,
    title: raw.Title,
    url: raw.URL,
    category: raw.Category as Category,
    progress: raw.Progress,
    notes: raw.Notes,
    tags: raw.Tags ? raw.Tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    coverUrl: raw.CoverURL,
    visibility: raw.Visibility as Visibility,
    dateAdded: raw.DateAdded,
  };
}

/** Converts a Bookmark back into an ordered array for writing to the Sheet */
export function bookmarkToRow(b: Bookmark): string[] {
  return [
    b.id,
    b.title,
    b.url,
    b.category,
    b.progress,
    b.notes,
    b.tags.join(", "),
    b.coverUrl,
    b.visibility,
    b.dateAdded,
  ];
}
