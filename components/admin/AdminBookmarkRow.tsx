"use client";

/**
 * AdminBookmarkRow — public BookmarkRow + admin controls.
 */
import { Bookmark } from "@/types/bookmark";
import { getCategoryColor, getCategoryEmoji } from "@/lib/categoryDisplay";

interface Props {
  bookmark: Bookmark;
  animationDelay?: number;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onProgressClick: (bookmark: Bookmark) => void;
}

export default function AdminBookmarkRow({
  bookmark,
  animationDelay = 0,
  onEdit,
  onDelete,
  onProgressClick,
}: Props) {
  const emoji = getCategoryEmoji(bookmark.category);
  const chipColor = getCategoryColor(bookmark.category);

  return (
    <div
      className="card-animate flex items-center gap-3 bg-[#fffbf8] border border-[#ecddd8] rounded-xl px-4 py-3 hover:shadow-sm hover:border-[#f2d4cc] transition-all duration-150"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg bg-[#f9ede8] flex items-center justify-center shrink-0 overflow-hidden">
        {bookmark.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bookmark.coverUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) parent.innerHTML = `<span class="text-lg">${emoji}</span>`;
            }}
          />
        ) : (
          <span className="text-lg">{emoji}</span>
        )}
      </div>

      {/* Title + notes */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sm text-[#3d2e2b] hover:text-[#c9847a] transition-colors truncate block font-serif"
        >
          {bookmark.title}
        </a>
        {bookmark.notes && (
          <p className="text-xs text-[#9a7e7a] truncate mt-0.5">{bookmark.notes}</p>
        )}
      </div>

      {/* Category */}
      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${chipColor}`}>
        {bookmark.category}
      </span>

      {/* Progress — clickable */}
      <button
        onClick={() => onProgressClick(bookmark)}
        className="shrink-0 text-xs text-[#c9847a] font-medium hidden sm:block hover:underline decoration-dotted min-w-[60px] text-left"
        title="Click to edit progress"
      >
        {bookmark.progress || <span className="text-[#c4a8a4] italic">—</span>}
      </button>

      {/* Visibility badge */}
      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
        bookmark.visibility === "public"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}>
        {bookmark.visibility}
      </span>

      {/* Tags */}
      <div className="hidden lg:flex flex-wrap gap-1 shrink-0 max-w-[160px]">
        {bookmark.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-[#dde8d8] text-[#9a7e7a] px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex gap-1">
        <button
          onClick={() => onEdit(bookmark)}
          className="text-xs px-2 py-1 rounded-lg border border-[#ecddd8] text-[#9a7e7a] hover:text-[#c9847a] hover:border-[#c9847a] transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="text-xs px-2 py-1 rounded-lg border border-[#ecddd8] text-[#9a7e7a] hover:text-red-400 hover:border-red-300 transition-colors"
        >
          Del
        </button>
      </div>
    </div>
  );
}
