"use client";

/**
 * FilterBar — category pills, tag multi-select, sort dropdown, and grid/list toggle.
 * Categories are loaded dynamically from the API.
 */
import { getCategoryEmoji } from "@/lib/categoryDisplay";

export type SortKey = "dateAdded" | "title" | "category";
export type ViewMode = "grid" | "list";

interface Props {
  allCategories: string[];
  allTags: string[];
  selectedCategory: string | null;
  selectedTags: string[];
  sortKey: SortKey;
  viewMode: ViewMode;
  onCategoryChange: (cat: string | null) => void;
  onTagToggle: (tag: string) => void;
  onSortChange: (sort: SortKey) => void;
  onViewChange: (view: ViewMode) => void;
}

export default function FilterBar({
  allCategories,
  allTags,
  selectedCategory,
  selectedTags,
  sortKey,
  viewMode,
  onCategoryChange,
  onTagToggle,
  onSortChange,
  onViewChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Category pills + view toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
            selectedCategory === null
              ? "bg-[#c9847a] text-white border-[#c9847a]"
              : "bg-white text-[#9a7e7a] border-[#ecddd8] hover:border-[#c9847a] hover:text-[#c9847a]"
          }`}
        >
          All
        </button>

        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
              selectedCategory === cat
                ? "bg-[#c9847a] text-white border-[#c9847a]"
                : "bg-white text-[#9a7e7a] border-[#ecddd8] hover:border-[#c9847a] hover:text-[#c9847a]"
            }`}
          >
            <span>{getCategoryEmoji(cat)}</span>
            {cat}
          </button>
        ))}

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center bg-white border border-[#ecddd8] rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange("grid")}
            title="Grid view"
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === "grid"
                ? "bg-[#f9ede8] text-[#c9847a]"
                : "text-[#9a7e7a] hover:text-[#c9847a]"
            }`}
          >
            ⊞
          </button>
          <button
            onClick={() => onViewChange("list")}
            title="List view"
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === "list"
                ? "bg-[#f9ede8] text-[#c9847a]"
                : "text-[#9a7e7a] hover:text-[#c9847a]"
            }`}
          >
            ≡
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="text-xs border border-[#ecddd8] rounded-lg px-2 py-1.5 bg-white text-[#9a7e7a] focus:outline-none focus:ring-1 focus:ring-[#c9847a]"
        >
          <option value="dateAdded">Date added</option>
          <option value="title">Title A–Z</option>
          <option value="category">Category</option>
        </select>
      </div>

      {/* Row 2: Tag pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                selectedTags.includes(tag)
                  ? "bg-[#b8c9b0] text-white border-[#b8c9b0]"
                  : "bg-white text-[#9a7e7a] border-[#ecddd8] hover:border-[#b8c9b0] hover:text-[#3d2e2b]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
