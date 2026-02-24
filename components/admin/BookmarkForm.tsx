"use client";

/**
 * BookmarkForm — slide-in panel for adding or editing a bookmark.
 * Handles all fields: Title, URL, Category, Progress, Notes, Tags,
 * CoverURL (manual + auto-fetch placeholder), Visibility.
 */
import { useState, useEffect } from "react";
import { Bookmark, Visibility } from "@/types/bookmark";
import { authHeaders } from "@/lib/session";

interface Props {
  /** If provided, form is in edit mode. If null, form is in add mode. */
  bookmark: Bookmark | null;
  /** Pre-filled title when coming from search (add mode only) */
  prefillTitle?: string;
  categories: string[];
  tags: string[];
  onSaved: () => void;
  onClose: () => void;
  onTagAdded: (tag: string) => void;
}

const EMPTY_FORM = {
  title: "",
  url: "",
  category: "",
  progress: "",
  notes: "",
  coverUrl: "",
  visibility: "private" as Visibility,
  tags: [] as string[],
};

export default function BookmarkForm({
  bookmark,
  prefillTitle = "",
  categories,
  tags: allTags,
  onSaved,
  onClose,
  onTagAdded,
}: Props) {
  const isEdit = bookmark !== null;

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetchingCover, setFetchingCover] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form on open
  useEffect(() => {
    if (isEdit && bookmark) {
      setForm({
        title: bookmark.title,
        url: bookmark.url,
        category: bookmark.category,
        progress: bookmark.progress,
        notes: bookmark.notes,
        coverUrl: bookmark.coverUrl,
        visibility: bookmark.visibility,
        tags: [...bookmark.tags],
      });
    } else {
      setForm({ ...EMPTY_FORM, title: prefillTitle, category: categories[0] ?? "" });
    }
    setErrors({});
  }, [bookmark, prefillTitle, isEdit, categories]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  async function handleAddNewTag() {
    const tag = newTag.trim().toLowerCase();
    if (!tag) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ tag }),
      });
      if (!res.ok) throw new Error();
      onTagAdded(tag);
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag("");
    } catch {
      // non-fatal — tag list will refresh on next load
    }
  }

  async function handleUrlBlur() {
    if (!form.url || form.coverUrl) return;
    setFetchingCover(true);
    try {
      const res = await fetch(`/api/fetch-cover?url=${encodeURIComponent(form.url)}`);
      if (res.ok) {
        const data = (await res.json()) as { coverUrl: string };
        if (data.coverUrl) setForm((prev) => ({ ...prev, coverUrl: data.coverUrl }));
      }
    } catch {
      // Cover fetch is best-effort
    } finally {
      setFetchingCover(false);
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.url.trim()) e.url = "URL is required";
    else {
      try { new URL(form.url); }
      catch { e.url = "Must be a valid URL"; }
    }
    if (!form.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      const url = isEdit ? `/api/bookmarks/${bookmark!.id}` : "/api/bookmarks";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      onSaved();
    } catch {
      setErrors({ submit: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      />

      {/* Slide-in panel — anchored to viewport right edge */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "100%",
          maxWidth: "448px",
          zIndex: 50,
          backgroundColor: "white",
          borderLeft: "1px solid #ecddd8",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ecddd8] shrink-0" style={{ padding: "16px 24px" }}>
          <h2 className="text-lg font-semibold text-[#3d2e2b]">
            {isEdit ? "Edit bookmark" : "Add bookmark"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9a7e7a] hover:text-[#3d2e2b] text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: "20px 24px", gap: "20px" }}>

          {/* Title */}
          <Field label="Title" error={errors.title} required>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Witch Hat Atelier"
              className={inputClass(!!errors.title)}
            />
          </Field>

          {/* URL */}
          <Field label="URL" error={errors.url} required>
            <input
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              onBlur={() => void handleUrlBlur()}
              placeholder="https://…"
              className={inputClass(!!errors.url)}
            />
            {fetchingCover && (
              <p className="text-xs text-[#9a7e7a] mt-1">Fetching cover…</p>
            )}
          </Field>

          {/* Category */}
          <Field label="Category" error={errors.category} required>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass(!!errors.category)}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          {/* Progress */}
          <Field label="Progress">
            <input
              value={form.progress}
              onChange={(e) => set("progress", e.target.value)}
              placeholder="e.g. Ch 25 p 12, Done, Paused…"
              className={inputClass(false)}
            />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Personal notes…"
              rows={3}
              className={inputClass(false) + " resize-none"}
            />
          </Field>

          {/* Cover URL */}
          <Field label="Cover image URL">
            <div className="flex gap-2">
              <input
                value={form.coverUrl}
                onChange={(e) => set("coverUrl", e.target.value)}
                placeholder="Auto-fetched or paste URL…"
                className={inputClass(false) + " flex-1"}
              />
              {form.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.coverUrl}
                  alt="Cover preview"
                  className="w-10 h-10 rounded-lg object-cover border border-[#ecddd8] shrink-0"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </div>
          </Field>

          {/* Visibility */}
          <Field label="Visibility">
            <div className="flex gap-2">
              {(["public", "private"] as Visibility[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("visibility", v)}
                  className={`flex-1 text-sm py-2 rounded-xl border transition-colors font-medium ${
                    form.visibility === v
                      ? v === "public"
                        ? "bg-green-100 border-green-300 text-green-700"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                      : "bg-white border-[#ecddd8] text-[#9a7e7a] hover:border-[#c9847a]"
                  }`}
                >
                  {v === "public" ? "🌐 Public" : "🔒 Private"}
                </button>
              ))}
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    form.tags.includes(tag)
                      ? "bg-[#b8c9b0] text-white border-[#b8c9b0]"
                      : "bg-white text-[#9a7e7a] border-[#ecddd8] hover:border-[#b8c9b0]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {/* Add new tag inline */}
            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleAddNewTag(); } }}
                placeholder="Add new tag…"
                className="flex-1 text-xs border border-[#ecddd8] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#c9847a] focus:border-[#c9847a]"
              />
              <button
                type="button"
                onClick={() => void handleAddNewTag()}
                className="text-xs px-3 py-1.5 bg-[#dde8d8] text-[#3d2e2b] rounded-lg hover:bg-[#b8c9b0] hover:text-white transition-colors"
              >
                Add
              </button>
            </div>
          </Field>

          {errors.submit && (
            <p className="text-sm text-red-400 text-center">{errors.submit}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#ecddd8] flex shrink-0" style={{ padding: "16px 24px", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, fontSize: "14px", padding: "10px", borderRadius: "12px", border: "1px solid #ecddd8", color: "#9a7e7a", background: "white", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            style={{ flex: 1, fontSize: "14px", padding: "10px", borderRadius: "12px", border: "none", background: saving ? "#d4a09a" : "#c9847a", color: "white", fontWeight: 500, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add bookmark"}
          </button>
        </div>
      </div>
    </>
  );
}

// Small helper components for consistent field layout
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#9a7e7a] uppercase tracking-wide">
        {label}{required && <span className="text-[#c9847a] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full text-sm border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9847a]/30 focus:border-[#c9847a] transition-colors ${
    hasError ? "border-red-300 bg-red-50" : "border-[#ecddd8] bg-white"
  }`;
}
