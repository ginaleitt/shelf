"use client";

/**
 * ProgressEditModal — small floating modal for inline progress editing.
 */
import { useState } from "react";
import { Bookmark } from "@/types/bookmark";
import { authHeaders } from "@/lib/session";

interface Props {
  bookmark: Bookmark;
  onSaved: () => void;
  onClose: () => void;
}

export default function ProgressEditModal({ bookmark, onSaved, onClose }: Props) {
  const [value, setValue] = useState(bookmark.progress);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (value === bookmark.progress) { onClose(); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ progress: value }),
      });
      if (!res.ok) throw new Error("Failed");
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-[#ecddd8] p-5 w-full max-w-xs mx-4">
        <p className="text-xs text-[#9a7e7a] mb-1">Progress for</p>
        <p className="font-semibold text-[#3d2e2b] mb-3 text-sm truncate">{bookmark.title}</p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSave();
            if (e.key === "Escape") onClose();
          }}
          placeholder="e.g. Ch 25 p 12, Done, Paused…"
          className="w-full text-sm border border-[#ecddd8] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9847a]/30 focus:border-[#c9847a] mb-3"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-xl border border-[#ecddd8] text-[#9a7e7a] hover:bg-[#fdf8f4] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="text-sm px-3 py-1.5 rounded-xl bg-[#c9847a] hover:bg-[#a96058] text-white transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
