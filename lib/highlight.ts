export function highlightMatch(text: string, query: string): string[] {
  if (!query.trim()) return [text];
  const regex = new RegExp(`(${escapeRegex(query.trim())})`, "gi");
  return text.split(regex).filter(Boolean);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
