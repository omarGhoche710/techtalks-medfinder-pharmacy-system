import type { SearchParams, SearchResult, Suggestion } from "@/lib/types";

type SearchApiResponse = {
  results: SearchResult[];
  query?: string;
  nearMe?: boolean;
  total?: number;
  error?: string;
};

function resultsToSuggestions(results: SearchResult[]): Suggestion[] {
  const medicineNames = new Set<string>();
  const pharmacyNames = new Set<string>();

  for (const result of results) {
    medicineNames.add(result.medicineName);
    pharmacyNames.add(result.pharmacy.name);
  }

  return [
    ...Array.from(medicineNames).map((text) => ({
      text,
      type: "medicine" as const,
    })),
    ...Array.from(pharmacyNames).map((text) => ({
      text,
      type: "pharmacy" as const,
    })),
  ].slice(0, 8);
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
  const payload = (await res.json().catch(() => ({}))) as Partial<SearchApiResponse>;
  if (!res.ok) {
    throw new Error(payload.error ?? "Search failed");
  }

  if (!payload.results || !Array.isArray(payload.results)) {
    return [];
  }

  return payload.results as SearchResult[];
}

export async function fetchSuggestions(
  params: SearchParams
): Promise<Suggestion[]> {
  const results = await fetchSearchResults(params);
  return resultsToSuggestions(results);
}
