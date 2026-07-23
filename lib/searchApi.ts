import type { SearchParams, SearchResult, Suggestion } from "@/lib/types";

export async function fetchSuggestions(query: string): Promise<Suggestion[]> {
  const res = await fetch(
    `/api/suggestions?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  const data = await res.json();
  return data.suggestions;
}

export async function fetchSearchResults(
  params: SearchParams
): Promise<SearchResult[]> {
  const url = new URL("/api/search", window.location.origin);
  url.searchParams.set("q", params.query);
  url.searchParams.set("nearMe", String(params.nearMe));
  if (params.lat !== undefined) url.searchParams.set("lat", String(params.lat));
  if (params.lng !== undefined) url.searchParams.set("lng", String(params.lng));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Search failed");
  }
  const data = await res.json();
  return data.results;
}
