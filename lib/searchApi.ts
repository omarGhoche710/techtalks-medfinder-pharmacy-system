import type { SearchParams, SearchPage, SearchResult, Suggestion } from "@/lib/types";

export type SearchApiResponse = {
  results: SearchResult[];
  query?: string;
  nearMe?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
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
): Promise<SearchPage> {
  const url = new URL("/api/search", window.location.origin);
  url.searchParams.set("q", params.query);
  url.searchParams.set("nearMe", String(params.nearMe));
  if (params.lat !== undefined) url.searchParams.set("lat", String(params.lat));
  if (params.lng !== undefined) url.searchParams.set("lng", String(params.lng));
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString());
  const payload = (await res.json().catch(() => ({}))) as Partial<SearchApiResponse>;
  if (!res.ok) {
    throw new Error(payload.error ?? "Search failed");
  }

  if (!payload.results || !Array.isArray(payload.results)) {
    return {
      results: [],
      total: 0,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 5,
      totalPages: 0,
    };
  }

  const results = payload.results as SearchResult[];
  const pageSize = payload.pageSize ?? params.pageSize ?? 5;
  const total = payload.total ?? results.length;
  const totalPages =
    payload.totalPages ??
    (total === 0 ? 0 : Math.ceil(total / pageSize));

  return {
    results,
    total,
    page: payload.page ?? params.page ?? 1,
    pageSize,
    totalPages,
  };
}

export async function fetchSuggestions(
  params: SearchParams
): Promise<Suggestion[]> {
  const searchPage = await fetchSearchResults(params);
  return resultsToSuggestions(searchPage.results);
}