"use client";

/**
 * AdminBookmarkCard — public BookmarkCard + admin controls overlay.
 * Shows edit/delete buttons and a visibility badge.
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

export default function AdminBookmarkCard({
  bookmark,
  animationDelay = 0,
  onEdit,
  onDelete,
  onProgressClick,
}: Props) {
  const emoji = getCategoryEmoji(bookmark.category);
  const chipColor = getCategoryColor(bookmark.category);

  return (
    <article
      className="card-animate bg-[#fffbf8] rounded-2xl border border-[#ecddd8] overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Visibility badge */}
      {bookmark.visibility === "private" && (
        <span className="absolute top-2 left-2 z-10 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800/70 text-white backdrop-blur-sm">
          private
        </span>
      )}

      {/* Cover */}
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="w-full h-40 bg-[#f9ede8] flex items-center justify-center overflow-hidden">
          {bookmark.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bookmark.coverUrl}
              alt={bookmark.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) parent.innerHTML = `<span class="text-4xl">${emoji}</span>`;
              }}
            />
          ) : (
            <span className="text-4xl">{emoji}</span>
          )}
        </div>
      </a>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#3d2e2b] hover:text-[#c9847a] transition-colors leading-snug line-clamp-2 font-serif"
          >
            {bookmark.title}
          </a>
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${chipColor}`}>
            {bookmark.category}
          </span>
        </div>

        {/* Progress — clickable to inline edit */}
        <button
          onClick={() => onProgressClick(bookmark)}
          className="text-xs text-[#c9847a] font-medium tracking-wide text-left hover:underline decoration-dotted"
          title="Click to edit progress"
        >
          {bookmark.progress || <span className="text-[#c4a8a4] italic">Add progress…</span>}
        </button>

        {bookmark.notes && (
          <p className="text-xs text-[#9a7e7a] leading-relaxed line-clamp-2">{bookmark.notes}</p>
        )}

        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {bookmark.tags.map((tag) => (
              <span key={tag} className="text-xs bg-[#dde8d8] text-[#9a7e7a] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Admin actions */}
        <div className="flex gap-1 pt-2 mt-1 border-t border-[#ecddd8]">
          <button
            onClick={() => onEdit(bookmark)}
            className="flex-1 text-xs py-1.5 rounded-lg border border-[#ecddd8] text-[#9a7e7a] hover:text-[#c9847a] hover:border-[#c9847a] transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(bookmark.id)}
            className="flex-1 text-xs py-1.5 rounded-lg border border-[#ecddd8] text-[#9a7e7a] hover:text-red-400 hover:border-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
