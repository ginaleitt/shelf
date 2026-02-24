"use client";

/**
 * AdminSearchBar — search input to find existing entries or signal a new one.
 */
interface Props {
  value: string;
  onChange: (val: string) => void;
  onAddNew: () => void;
}

export default function AdminSearchBar({ value, onChange, onAddNew }: Props) {
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4a8a4] text-sm">🔍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by title…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#ecddd8] rounded-xl bg-white text-[#3d2e2b] placeholder:text-[#c4a8a4] focus:outline-none focus:ring-2 focus:ring-[#c9847a]/30 focus:border-[#c9847a]"
        />
      </div>
      <button
        onClick={onAddNew}
        className="text-sm px-4 py-2 bg-[#c9847a] hover:bg-[#a96058] text-white rounded-xl transition-colors whitespace-nowrap font-medium"
      >
        + Add new
      </button>
    </div>
  );
}
