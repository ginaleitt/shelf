/**
 * BookmarkRow — compact list/table row for a single bookmark.
 */
import { Bookmark } from "@/types/bookmark";
import { getCategoryColor, getCategoryEmoji } from "@/lib/categoryDisplay";

interface Props {
  bookmark: Bookmark;
  animationDelay?: number;
}

export default function BookmarkRow({ bookmark, animationDelay = 0 }: Props) {
  const emoji = getCategoryEmoji(bookmark.category);
  const chipColor = getCategoryColor(bookmark.category);

  return (
    <div
      className="card-animate flex items-center gap-4 bg-[#fffbf8] border border-[#ecddd8] rounded-xl px-4 py-3 hover:shadow-sm hover:border-[#f2d4cc] transition-all duration-150"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Cover thumbnail or emoji */}
      <div className="w-10 h-10 rounded-lg bg-[#f9ede8] flex items-center justify-center shrink-0 overflow-hidden">
        {bookmark.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bookmark.coverUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) parent.innerHTML = `<span class="text-lg">${emoji}</span>`;
            }}
          />
        ) : (
          <span className="text-lg">{emoji}</span>
        )}
      </div>

      {/* Title */}
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
          <p className="text-xs text-[#9a7e7a] truncate mt-0.5">
            {bookmark.notes}
          </p>
        )}
      </div>

      {/* Category chip */}
      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${chipColor}`}>
        {bookmark.category}
      </span>

      {/* Progress */}
      {bookmark.progress && (
        <span className="shrink-0 text-xs text-[#c9847a] font-medium hidden sm:block">
          {bookmark.progress}
        </span>
      )}

      {/* Tags — hidden on small screens */}
      <div className="hidden md:flex flex-wrap gap-1 shrink-0 max-w-[180px]">
        {bookmark.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-[#dde8d8] text-[#9a7e7a] px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
