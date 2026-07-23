"use client";

import FilterBar from "@/components/search/FilterBar";
import ResultListItem from "@/components/search/ResultListItem";
import SearchBar from "@/components/search/SearchBar";
import SearchStateView from "@/components/search/SearchStateView";
import SortControls from "@/components/search/SortControls";
import { useGeolocation } from "@/hooks/useGeolocation";
import { applyFilters, applySorting } from "@/lib/filters";
import { fetchSearchResults } from "@/lib/searchApi";
import type {
  FilterState,
  SearchResult,
  SearchState,
  SortOption,
} from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

type SearchPageClientProps = {
  initialQuery: string;
  initialNearMe: boolean;
  initialLat?: number;
  initialLng?: number;
};

export default function SearchPageClient({
  initialQuery,
  initialNearMe,
  initialLat,
  initialLng,
}: SearchPageClientProps) {
  const geo = useGeolocation(initialNearMe);
  const [query, setQuery] = useState(initialQuery);
  const [nearMe, setNearMe] = useState(initialNearMe);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<SearchState>(
    initialQuery ? "loading" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>(
    initialNearMe ? "distance" : "price_asc"
  );
  const [filters, setFilters] = useState<FilterState>({
    maxDistance: null,
    maxPrice: null,
    availability: "all",
  });

  const lat = initialLat ?? geo.lat;
  const lng = initialLng ?? geo.lng;

  const runSearch = useCallback(
    async (searchQuery: string, useNearMe: boolean) => {
      if (!searchQuery.trim()) {
        setState("idle");
        setResults([]);
        return;
      }

      setState("loading");
      setError(null);
      setQuery(searchQuery);

      try {
        const data = await fetchSearchResults({
          query: searchQuery,
          nearMe: useNearMe,
          lat: useNearMe ? lat : undefined,
          lng: useNearMe ? lng : undefined,
        });
        setResults(data);
        setState(data.length > 0 ? "success" : "empty");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setState("error");
        setResults([]);
      }
    },
    [lat, lng]
  );

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery, initialNearMe);
    }
  }, [initialQuery, initialNearMe, runSearch]);

  const filteredResults = useMemo(() => {
    const filtered = applyFilters(results, filters, nearMe);
    return applySorting(filtered, sort, nearMe);
  }, [results, filters, sort, nearMe]);

  const handleSearch = (searchQuery: string, useNearMe: boolean) => {
    setNearMe(useNearMe);
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("nearMe", String(useNearMe));
    if (useNearMe) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    window.history.replaceState(null, "", `/search?${params.toString()}`);
    runSearch(searchQuery, useNearMe);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <SearchBar
          initialQuery={query}
          initialNearMe={nearMe}
          onSearch={handleSearch}
          lat={lat}
          lng={lng}
          geoLoading={geo.loading}
        />
        {geo.error && nearMe && (
          <p className="mt-2 text-xs text-amber-600" role="status">
            {geo.error}
          </p>
        )}
      </div>

      {state === "success" && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {filteredResults.length}
            </span>{" "}
            result{filteredResults.length !== 1 ? "s" : ""} for &ldquo;{query}
            &rdquo;
            {nearMe && (
              <span className="ml-1 text-[#2563eb]">· Near Me</span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <FilterBar
              filters={filters}
              nearMe={nearMe}
              onChange={setFilters}
            />
            <SortControls sort={sort} nearMe={nearMe} onChange={setSort} />
          </div>
        </div>
      )}

      {state === "success" && filteredResults.length === 0 && (
        <SearchStateView state="empty" query={query} />
      )}

      {state === "success" && filteredResults.length > 0 && (
        <div
          role="list"
          aria-label="Search results"
          className="mx-auto flex max-w-3xl flex-col gap-3"
        >
          {filteredResults.map((result) => (
            <ResultListItem
              key={result.id}
              result={result}
              nearMe={nearMe}
            />
          ))}
        </div>
      )}

      {state !== "success" && (
        <SearchStateView
          state={state}
          query={query}
          error={error}
          onRetry={() => runSearch(query, nearMe)}
        />
      )}
    </div>
  );
}
