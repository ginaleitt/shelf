/**
 * BookmarkCard — card grid view for a single bookmark.
 * Shows cover image (or emoji fallback), title, category chip,
 * progress, notes, and tags.
 */
import { Bookmark } from "@/types/bookmark";
import { getCategoryColor, getCategoryEmoji } from "@/lib/categoryDisplay";

interface Props {
  bookmark: Bookmark;
  animationDelay?: number;
}

export default function BookmarkCard({ bookmark, animationDelay = 0 }: Props) {
  const emoji = getCategoryEmoji(bookmark.category);
  const chipColor = getCategoryColor(bookmark.category);

  return (
    <article
      className="card-animate bg-[#fffbf8] rounded-2xl border border-[#ecddd8] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Cover image or emoji placeholder */}
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`Open ${bookmark.title}`}
      >
        <div className="w-full h-40 bg-[#f9ede8] flex items-center justify-center overflow-hidden">
          {bookmark.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bookmark.coverUrl}
              alt={bookmark.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fall back to emoji on broken image
                const target = e.currentTarget;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-4xl">${emoji}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-4xl">{emoji}</span>
          )}
        </div>
      </a>

      <div className="p-4 flex flex-col gap-2">
        {/* Title + category chip */}
        <div className="flex items-start justify-between gap-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#3d2e2b] hover:text-[#c9847a] transition-colors leading-snug line-clamp-2 font-serif"
          >
            {bookmark.title}
          </a>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${chipColor}`}
          >
            {bookmark.category}
          </span>
        </div>

        {/* Progress */}
        {bookmark.progress && (
          <p className="text-xs text-[#c9847a] font-medium tracking-wide">
            {bookmark.progress}
          </p>
        )}

        {/* Notes */}
        {bookmark.notes && (
          <p className="text-xs text-[#9a7e7a] leading-relaxed line-clamp-3">
            {bookmark.notes}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-[#dde8d8] text-[#9a7e7a] px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
