"use client";

/**
 * Admin page — browse all bookmarks with add/edit form, delete,
 * inline progress editing, and full filtering.
 */
import { useEffect, useState, useMemo } from "react";
import { Bookmark } from "@/types/bookmark";
import { authHeaders } from "@/lib/session";
import AdminBookmarkCard from "@/components/admin/AdminBookmarkCard";
import AdminBookmarkRow from "@/components/admin/AdminBookmarkRow";
import DeleteDialog from "@/components/admin/DeleteDialog";
import ProgressEditModal from "@/components/admin/ProgressEditModal";
import BookmarkForm from "@/components/admin/BookmarkForm";

type ViewMode = "grid" | "list";
type SortKey = "dateAdded" | "title" | "category";
const VIEW_KEY = "shelf_admin_view_mode";

export default function AdminPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progressTarget, setProgressTarget] = useState<Bookmark | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formBookmark, setFormBookmark] = useState<Bookmark | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  function handleViewChange(v: ViewMode) {
    setViewMode(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  async function fetchAll() {
    try {
      const [bmRes, catRes, tagRes] = await Promise.all([
        fetch("/api/admin/bookmarks", { headers: authHeaders() }),
        fetch("/api/categories"),
        fetch("/api/tags"),
      ]);
      if (!bmRes.ok) throw new Error("Failed to fetch bookmarks");
      setBookmarks((await bmRes.json()) as Bookmark[]);
      if (catRes.ok) setCategories((await catRes.json()) as string[]);
      if (tagRes.ok) setAllTags((await tagRes.json()) as string[]);
    } catch {
      setError("Failed to load bookmarks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchAll(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
      }
      setDeleteTarget(null);
      showToast("Bookmark deleted");
      await fetchAll();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete — check console");
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    let result = [...bookmarks];
    if (search) result = result.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== "all") result = result.filter((b) => b.category === categoryFilter);
    if (visibilityFilter !== "all") result = result.filter((b) => b.visibility === visibilityFilter);
    if (tagFilter !== "all") result = result.filter((b) => b.tags.includes(tagFilter));
    result.sort((a, b) => {
      if (sortKey === "title") return a.title.localeCompare(b.title);
      if (sortKey === "category") return a.category.localeCompare(b.category);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });
    return result;
  }, [bookmarks, search, categoryFilter, visibilityFilter, tagFilter, sortKey]);

  const hasFilters = search || categoryFilter !== "all" || visibilityFilter !== "all" || tagFilter !== "all";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#3d2e2b]">Bookmarks</h2>
          <p className="text-sm text-[#9a7e7a] mt-0.5">{bookmarks.length} total</p>
        </div>
        <button
          onClick={() => { setFormBookmark(null); setFormOpen(true); }}
          className="text-sm px-4 py-2 bg-[#c9847a] hover:bg-[#a96058] text-white rounded-xl transition-colors font-medium"
        >
          + Add new
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-white border border-[#ecddd8] rounded-xl flex flex-col" style={{ padding: "12px", gap: "12px" }}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4a8a4] text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#ecddd8] rounded-xl bg-[#fdf8f4] text-[#3d2e2b] placeholder:text-[#c4a8a4] focus:outline-none focus:ring-2 focus:ring-[#c9847a]/30 focus:border-[#c9847a]"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-[#ecddd8] rounded-lg px-2 py-1.5 bg-white text-[#9a7e7a] focus:outline-none focus:ring-1 focus:ring-[#c9847a]">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}
            className="text-xs border border-[#ecddd8] rounded-lg px-2 py-1.5 bg-white text-[#9a7e7a] focus:outline-none focus:ring-1 focus:ring-[#c9847a]">
            <option value="all">All visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}
            className="text-xs border border-[#ecddd8] rounded-lg px-2 py-1.5 bg-white text-[#9a7e7a] focus:outline-none focus:ring-1 focus:ring-[#c9847a]">
            <option value="all">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-xs border border-[#ecddd8] rounded-lg px-2 py-1.5 bg-white text-[#9a7e7a] focus:outline-none focus:ring-1 focus:ring-[#c9847a]">
            <option value="dateAdded">Date added</option>
            <option value="title">Title A–Z</option>
            <option value="category">Category</option>
          </select>

          {hasFilters && (
            <button onClick={() => { setSearch(""); setCategoryFilter("all"); setVisibilityFilter("all"); setTagFilter("all"); }}
              className="text-xs text-[#9a7e7a] hover:text-[#c9847a] transition-colors">
              Clear
            </button>
          )}

          <div className="flex-1" />

          <div className="flex items-center bg-[#fdf8f4] border border-[#ecddd8] rounded-lg overflow-hidden">
            <button onClick={() => handleViewChange("grid")}
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "grid" ? "bg-[#f9ede8] text-[#c9847a]" : "text-[#9a7e7a] hover:text-[#c9847a]"}`}>
              ⊞
            </button>
            <button onClick={() => handleViewChange("list")}
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "list" ? "bg-[#f9ede8] text-[#c9847a]" : "text-[#9a7e7a] hover:text-[#c9847a]"}`}>
              ≡
            </button>
          </div>

          <span className="text-xs text-[#c4a8a4]">{filtered.length} {filtered.length === 1 ? "result" : "results"}</span>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-[#f2d4cc] border-t-[#c9847a] animate-spin" />
        </div>
      )}

      {error && <div className="text-center py-16 text-[#9a7e7a] text-sm">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🌿</p>
          <p className="text-[#9a7e7a] text-sm mb-3">
            {bookmarks.length === 0 ? "No bookmarks yet." : "No results match your filters."}
          </p>
          {search && filtered.length === 0 && (
            <button
              onClick={() => { setFormBookmark(null); setFormOpen(true); }}
              className="text-sm px-4 py-2 bg-[#c9847a] hover:bg-[#a96058] text-white rounded-xl transition-colors"
            >
              + Add "{search}"
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" style={{ marginTop: "24px" }}>
          {filtered.map((b, i) => (
            <AdminBookmarkCard
              key={b.id}
              bookmark={b}
              animationDelay={i * 40}
              onEdit={(bk) => { setFormBookmark(bk); setFormOpen(true); }}
              onDelete={(id) => { const t = bookmarks.find((x) => x.id === id); if (t) setDeleteTarget(t); }}
              onProgressClick={setProgressTarget}
            />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && viewMode === "list" && (
        <div className="flex flex-col gap-2" style={{ marginTop: "24px" }}>
          {filtered.map((b, i) => (
            <AdminBookmarkRow
              key={b.id}
              bookmark={b}
              animationDelay={i * 30}
              onEdit={(bk) => { setFormBookmark(bk); setFormOpen(true); }}
              onDelete={(id) => { const t = bookmarks.find((x) => x.id === id); if (t) setDeleteTarget(t); }}
              onProgressClick={setProgressTarget}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteDialog
          title={deleteTarget.title}
          onConfirm={() => void handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {progressTarget && (
        <ProgressEditModal
          bookmark={progressTarget}
          onSaved={() => { setProgressTarget(null); showToast("Progress saved!"); void fetchAll(); }}
          onClose={() => setProgressTarget(null)}
        />
      )}

      {formOpen && (
        <BookmarkForm
          bookmark={formBookmark}
          prefillTitle={!formBookmark && search && filtered.length === 0 ? search : ""}
          categories={categories}
          tags={allTags}
          onSaved={() => {
            setFormOpen(false);
            setFormBookmark(null);
            showToast(formBookmark ? "Bookmark updated!" : "Bookmark added!");
            void fetchAll();
          }}
          onClose={() => { setFormOpen(false); setFormBookmark(null); }}
          onTagAdded={(tag) => setAllTags((prev) => [...prev, tag])}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#3d2e2b] text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
