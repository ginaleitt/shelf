/**
 * Display helpers for categories — emoji fallbacks and color chips.
 * Works with any category string, with fallbacks for unknown values.
 */

const CATEGORY_EMOJI: Record<string, string> = {
  Manga: "📖",
  Book: "📚",
  Video: "🎬",
  Game: "🎮",
  Music: "🎵",
  Podcast: "🎙️",
  Article: "📰",
  Data: "📊",
};

const CATEGORY_COLORS: Record<string, string> = {
  Manga: "bg-rose-100 text-rose-600",
  Book: "bg-amber-100 text-amber-700",
  Video: "bg-purple-100 text-purple-600",
  Game: "bg-teal-100 text-teal-700",
  Music: "bg-blue-100 text-blue-600",
  Podcast: "bg-orange-100 text-orange-700",
  Article: "bg-gray-100 text-gray-600",
};

// Fallback colors cycling for unknown categories
const FALLBACK_COLORS = [
  "bg-pink-100 text-pink-600",
  "bg-indigo-100 text-indigo-600",
  "bg-lime-100 text-lime-700",
  "bg-cyan-100 text-cyan-700",
];

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? "📌";
}

export function getCategoryColor(category: string): string {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  // Deterministic fallback based on string hash
  const index = category.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}
