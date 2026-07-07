import type { Medication } from "@/data/medications";

export function filterMedications(
  items: Medication[],
  query: string
): Medication[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(trimmed) ||
      item.code.toLowerCase().includes(trimmed) ||
      item.description.toLowerCase().includes(trimmed)
  );
}

export function getAutocompleteSuggestions(
  items: Medication[],
  query: string,
  limit = 6
): Medication[] {
  return filterMedications(items, query).slice(0, limit);
}

export function highlightMatch(text: string, query: string): string[] {
  if (!query.trim()) return [text];

  const regex = new RegExp(`(${escapeRegex(query.trim())})`, "gi");
  return text.split(regex).filter(Boolean);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
