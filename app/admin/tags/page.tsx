"use client";

/**
 * Tag management page — view, add, and delete predefined tags.
 * Also shows category list for reference.
 */
import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/session";

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    try {
      const [tagRes, catRes] = await Promise.all([
        fetch("/api/tags"),
        fetch("/api/categories"),
      ]);
      if (tagRes.ok) setTags((await tagRes.json()) as string[]);
      if (catRes.ok) setCategories((await catRes.json()) as string[]);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchData(); }, []);

  async function handleAddTag() {
    const tag = newTag.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setAdding(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ tag }),
      });
      if (!res.ok) throw new Error();
      setNewTag("");
      showToast(`Tag "${tag}" added`);
      await fetchData();
    } catch {
      showToast("Failed to add tag");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteTag(tag: string) {
    setDeletingTag(tag);
    try {
      const res = await fetch(`/api/tags?tag=${encodeURIComponent(tag)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      showToast(`Tag "${tag}" removed`);
      await fetchData();
    } catch {
      showToast("Failed to delete tag");
    } finally {
      setDeletingTag(null);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#3d2e2b]">Tags & Categories</h2>
        <p className="text-sm text-[#9a7e7a] mt-0.5">
          Manage your predefined tags. Categories are managed directly in your Google Sheet.
        </p>
      </div>

      {/* Tags section */}
      <div className="bg-white border border-[#ecddd8] rounded-xl mb-4" style={{ padding: "20px" }}>
        <h3 className="text-sm font-semibold text-[#3d2e2b] mb-4">Tags</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-[#f2d4cc] border-t-[#c9847a] animate-spin" />
          </div>
        ) : (
          <>
            {/* Tag list */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
              {tags.length === 0 && (
                <p className="text-sm text-[#c4a8a4] italic">No tags yet.</p>
              )}
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-[#dde8d8] text-[#3d2e2b] text-xs px-2.5 py-1 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => void handleDeleteTag(tag)}
                    disabled={deletingTag === tag}
                    className="text-[#9a7e7a] hover:text-red-400 transition-colors ml-0.5 disabled:opacity-40 leading-none"
                    title={`Remove "${tag}"`}
                  >
                    {deletingTag === tag ? "…" : "✕"}
                  </button>
                </div>
              ))}
            </div>

            {/* Add tag */}
            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleAddTag(); }}
                placeholder="New tag name…"
                className="flex-1 text-sm border border-[#ecddd8] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9847a]/30 focus:border-[#c9847a]"
              />
              <button
                onClick={() => void handleAddTag()}
                disabled={adding || !newTag.trim()}
                className="text-sm px-4 py-2 bg-[#c9847a] hover:bg-[#a96058] text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {adding ? "Adding…" : "Add"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Categories section — read only, managed in Sheet */}
      <div className="bg-white border border-[#ecddd8] rounded-xl" style={{ padding: "20px" }}>
        <h3 className="text-sm font-semibold text-[#3d2e2b] mb-1">Categories</h3>
        <p className="text-xs text-[#9a7e7a] mb-4">
          Edit these directly in the <strong>Categories</strong> tab of your Google Sheet.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="text-xs px-3 py-1 rounded-full bg-[#f9ede8] text-[#c9847a] border border-[#f2d4cc]"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {toast && (
        <div
          style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}
          className="bg-[#3d2e2b] text-white text-sm px-4 py-2 rounded-xl shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
