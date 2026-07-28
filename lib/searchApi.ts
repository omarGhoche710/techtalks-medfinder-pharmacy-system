import type { SearchParams, SearchResult, Suggestion } from "@/lib/types";

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
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Search failed");
  }
  const data = await res.json();
  return data.results;
}

export async function fetchSuggestions(
  params: SearchParams
): Promise<Suggestion[]> {
  const results = await fetchSearchResults(params);
  return resultsToSuggestions(results);
}
