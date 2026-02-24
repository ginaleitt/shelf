"use client";

/**
 * Public page — the main shareable shelf view.
 * Fetches public bookmarks and tags, renders filterable card/list UI.
 */
import { useEffect, useState, useMemo } from "react";
import { Bookmark } from "@/types/bookmark";
import BookmarkCard from "@/components/BookmarkCard";
import BookmarkRow from "@/components/BookmarkRow";
import FilterBar, { SortKey, ViewMode } from "@/components/FilterBar";

const VIEW_PREF_KEY = "shelf_view_mode";

export default function PublicPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Load saved view preference
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_PREF_KEY);
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  // Persist view preference
  function handleViewChange(view: ViewMode) {
    setViewMode(view);
    localStorage.setItem(VIEW_PREF_KEY, view);
  }

  // Fetch bookmarks and tags on mount
  useEffect(() => {
    async function load() {
      try {
        const [bmRes, tagRes, catRes] = await Promise.all([
          fetch("/api/bookmarks"),
          fetch("/api/tags"),
          fetch("/api/categories"),
        ]);

        if (!bmRes.ok) throw new Error("Failed to load bookmarks");
        if (!tagRes.ok) throw new Error("Failed to load tags");
        if (!catRes.ok) throw new Error("Failed to load categories");

        const bm = (await bmRes.json()) as Bookmark[];
        const tg = (await tagRes.json()) as string[];
        const cats = (await catRes.json()) as string[];

        setBookmarks(bm);
        setTags(tg);
        setCategories(cats);
      } catch (err) {
        setError("Couldn't load shelf. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function handleTagToggle(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  // Filter and sort bookmarks
  const filtered = useMemo(() => {
    let result = [...bookmarks];

    if (selectedCategory) {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      result = result.filter((b) =>
        selectedTags.every((t) => b.tags.includes(t))
      );
    }

    result.sort((a, b) => {
      if (sortKey === "title") return a.title.localeCompare(b.title);
      if (sortKey === "category") return a.category.localeCompare(b.category);
      // dateAdded — newest first
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

    return result;
  }, [bookmarks, selectedCategory, selectedTags, sortKey]);

  return (
    <div className="relative z-10 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
      {/* Header */}
      <header className="pt-12 pb-8">
        <h1 className="text-4xl font-semibold text-[#3d2e2b] mb-1">
          My Shelf
        </h1>
        <p className="text-[#9a7e7a] text-sm">
          things I&apos;m reading, watching & playing
        </p>
      </header>

      <main className="pb-16">
        {/* Filter bar */}
        {!loading && !error && (
          <div className="mb-6">
            <FilterBar
              allCategories={categories}
              allTags={tags}
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
              sortKey={sortKey}
              viewMode={viewMode}
              onCategoryChange={setSelectedCategory}
              onTagToggle={handleTagToggle}
              onSortChange={setSortKey}
              onViewChange={handleViewChange}
            />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#f2d4cc] border-t-[#c9847a] animate-spin" />
              <p className="text-sm text-[#9a7e7a]">Loading…</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-24">
            <p className="text-[#9a7e7a]">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🌿</p>
            <p className="text-[#9a7e7a] font-medium">Nothing here yet</p>
            <p className="text-sm text-[#c4a8a4] mt-1">
              {bookmarks.length === 0
                ? "Add something from the admin panel to get started."
                : "No results match your filters."}
            </p>
          </div>
        )}

        {/* Grid view */}
        {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((b, i) => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                animationDelay={i * 40}
              />
            ))}
          </div>
        )}

        {/* List view */}
        {!loading && !error && filtered.length > 0 && viewMode === "list" && (
          <div className="flex flex-col gap-2">
            {filtered.map((b, i) => (
              <BookmarkRow
                key={b.id}
                bookmark={b}
                animationDelay={i * 30}
              />
            ))}
          </div>
        )}

        {/* Result count */}
        {!loading && !error && filtered.length > 0 && (
          <p className="text-xs text-[#c4a8a4] text-center mt-8">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </p>
        )}
      </main>
      </div>
    </div>
  );
}
