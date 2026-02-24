/**
 * Core data types matching the Google Sheet column structure.
 */

export type Category = string;
export type Visibility = "public" | "private";

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: Category;
  progress: string;
  notes: string;
  tags: string[]; // stored as comma-separated in Sheet, parsed to array
  coverUrl: string;
  visibility: Visibility;
  dateAdded: string; // ISO timestamp
}

/** Shape of a row as it comes raw from the Sheet (all strings) */
export interface RawBookmarkRow {
  ID: string;
  Title: string;
  URL: string;
  Category: string;
  Progress: string;
  Notes: string;
  Tags: string;
  CoverURL: string;
  Visibility: string;
  DateAdded: string;
}
